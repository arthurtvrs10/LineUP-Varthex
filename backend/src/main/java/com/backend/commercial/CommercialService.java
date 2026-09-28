package com.backend.commercial;

import com.backend.customers.CustomerRepository;
import com.backend.scheduling.Appointment;
import com.backend.scheduling.AppointmentRepository;
import com.backend.scheduling.AppointmentStatus;
import com.backend.tenants.Tenant;
import com.backend.users.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class CommercialService {
    private final EntityManager em;
    private final CashRegisterRepository registers;
    private final PaymentRepository payments;
    private final ProductRepository products;
    private final StockMovementRepository stock;
    private final LoyaltyMovementRepository loyalty;
    private final ReviewRepository reviews;
    private final CampaignRepository campaigns;
    private final AuditEventRepository audit;
    private final AppointmentRepository appointments;
    private final CustomerRepository customers;
    private final UserRepository users;

    public CommercialService(EntityManager em, CashRegisterRepository registers, PaymentRepository payments,
            ProductRepository products, StockMovementRepository stock, LoyaltyMovementRepository loyalty,
            ReviewRepository reviews, CampaignRepository campaigns, AuditEventRepository audit,
            AppointmentRepository appointments, CustomerRepository customers, UserRepository users) {
        this.em=em; this.registers=registers; this.payments=payments; this.products=products;
        this.stock=stock; this.loyalty=loyalty; this.reviews=reviews; this.campaigns=campaigns;
        this.audit=audit; this.appointments=appointments; this.customers=customers; this.users=users;
    }

    static void require(boolean condition, String message) {
        if (!condition) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
    static String text(String value, String label) {
        require(value != null && !value.isBlank() && value.length() <= 1000, label + " é obrigatório (até 1000 caracteres)");
        return value.trim();
    }
    static BigDecimal money(BigDecimal value, boolean positive) {
        require(value != null && value.scale() <= 2 && value.compareTo(new BigDecimal("999999999.99")) <= 0
                && (positive ? value.signum()>0 : value.signum()>=0), "Informe um valor válido com até duas casas decimais");
        return value.setScale(2);
    }
    void lock(UUID tenantId) {
        if (tenantId == null || em.find(Tenant.class, tenantId, LockModeType.PESSIMISTIC_WRITE) == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbearia não encontrada");
    }
    void event(UUID tenant, UUID actor, String action, UUID target) {
        AuditEvent e=new AuditEvent();e.tenantId=tenant;e.actorId=actor;e.action=action;e.targetId=target;e.createdAt=LocalDateTime.now();audit.save(e);
    }
    private Appointment appointment(UUID tenant, UUID id) {
        return appointments.findById(id).filter(a->tenant.equals(a.getTenantId()))
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Atendimento não encontrado"));
    }
    private void customer(UUID tenant, UUID id) {
        if (id == null || customers.findById(id).filter(c->tenant.equals(c.getTenantId())).isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente não encontrado");
    }
    private CashRegister open(UUID tenant) {
        return registers.findAllByTenantId(tenant).stream().filter(r->r.closedAt==null).findFirst()
                .orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Abra o caixa antes de registrar movimentos"));
    }
    public record OpenCash(BigDecimal amount) {}
    public CashRegister openCash(UUID tenant, UUID actor, OpenCash input) {
        lock(tenant);require(registers.findAllByTenantId(tenant).stream().noneMatch(r->r.closedAt==null),"Já existe um caixa aberto");
        CashRegister r=new CashRegister();r.tenantId=tenant;r.openedBy=actor;r.openedAt=LocalDateTime.now();r.openingAmount=money(input.amount(),false);
        registers.save(r);event(tenant,actor,"CASH_OPEN",r.id);return r;
    }
    public record CloseCash(BigDecimal amount, String reason) {}
    public CashRegister closeCash(UUID tenant, UUID actor, CloseCash input) {
        lock(tenant);CashRegister r=open(tenant);r.countedAmount=money(input.amount(),false);r.closingReason=text(input.reason(),"Justificativa");
        r.expectedAmount=cashBalance(tenant,r);r.closedAt=LocalDateTime.now();event(tenant,actor,"CASH_CLOSE",r.id);return registers.save(r);
    }
    private BigDecimal cashBalance(UUID tenant,CashRegister r) {
        return payments.findAllByTenantId(tenant).stream().filter(p->r.id.equals(p.registerId)&&"CASH".equals(p.method))
                .map(p->p.amount).reduce(r.openingAmount,BigDecimal::add);
    }
    public Map<String,Object> finance(UUID tenant) {
        List<CashRegister> rs=registers.findAllByTenantId(tenant);CashRegister current=rs.stream().filter(r->r.closedAt==null).findFirst().orElse(null);
        Map<String,Object> result=new LinkedHashMap<>();result.put("registers",rs);result.put("payments",payments.findAllByTenantId(tenant));
        result.put("balance",current==null?BigDecimal.ZERO:cashBalance(tenant,current));return result;
    }
    public Map<String,Object> receipt(UUID tenant,UUID appointmentId) {
        Appointment a=appointment(tenant,appointmentId);
        require(a.getStatus()==AppointmentStatus.COMPLETED,"Comprovante disponível após concluir o atendimento");
        Tenant business=em.find(Tenant.class,tenant);
        var unit=em.find(com.backend.units.Unit.class,a.getUnitId());
        var client=customers.findById(a.getCustomerId()).orElseThrow();
        var entries=payments.findAllByTenantId(tenant).stream().filter(p->appointmentId.equals(p.appointmentId)).toList();
        BigDecimal paid=entries.stream().map(p->p.amount).reduce(BigDecimal.ZERO,BigDecimal::add);
        Map<String,Object> receipt=new LinkedHashMap<>();
        receipt.put("appointmentId",appointmentId);receipt.put("establishment",business.getTradeName());
        receipt.put("unit",unit.getName());receipt.put("customer",client.getFullName());receipt.put("date",a.getStartAt());
        receipt.put("items",a.getItems().stream().map(i->Map.of("name",i.getName(),"amount",i.getUnitPrice())).toList());
        receipt.put("total",a.getTotalAmount());receipt.put("paid",paid);receipt.put("remaining",a.getTotalAmount().subtract(paid));
        receipt.put("payments",entries);receipt.put("fiscal",false);return receipt;
    }
    public record PaymentInput(UUID appointmentId, BigDecimal amount, String method, String kind, String reason, String requestKey) {}
    public Payment pay(UUID tenant, UUID actor, PaymentInput input) {
        lock(tenant);String key=text(input.requestKey(),"Identificador da operação");
        Optional<Payment> prior=payments.findAllByTenantId(tenant).stream().filter(p->key.equals(p.requestKey)).findFirst();
        if(prior.isPresent()) {
            Payment previous=prior.get();
            if(!Objects.equals(previous.appointmentId,input.appointmentId()) || input.amount()==null || previous.amount.abs().compareTo(input.amount())!=0 || !Objects.equals(previous.kind,input.kind()) || !Objects.equals(previous.method,input.method()) || !Objects.equals(previous.reason,input.reason()==null?null:input.reason().trim()))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Identificador já usado para outra operação");
            return previous;
        }
        require(Set.of("CASH","PIX","CARD").contains(input.method()==null?"":input.method()),"Meio de pagamento inválido");
        require(Set.of("PAYMENT","SUPPLY","WITHDRAWAL").contains(input.kind()==null?"":input.kind()),"Tipo de movimento inválido");
        BigDecimal amount=money(input.amount(),true);CashRegister r=open(tenant);Appointment a=null;
        if("PAYMENT".equals(input.kind())) {
            require(input.appointmentId()!=null,"Selecione um atendimento");a=appointment(tenant,input.appointmentId());
            require(a.getStatus()==AppointmentStatus.COMPLETED,"Somente atendimentos concluídos podem ser recebidos");
            BigDecimal received=payments.findAllByTenantId(tenant).stream().filter(p->input.appointmentId().equals(p.appointmentId)).map(p->p.amount).reduce(BigDecimal.ZERO,BigDecimal::add);
            require(received.add(amount).compareTo(a.getTotalAmount())<=0,"O valor excede o saldo do atendimento");
        } else {
            require("CASH".equals(input.method()),"Suprimento e sangria usam dinheiro");
            require(input.appointmentId()==null,"Movimento de caixa não deve informar atendimento");
        }
        if("WITHDRAWAL".equals(input.kind())) {require(cashBalance(tenant,r).compareTo(amount)>=0,"Saldo insuficiente no caixa");amount=amount.negate();}
        Payment p=new Payment();p.tenantId=tenant;p.registerId=r.id;p.appointmentId=input.appointmentId();p.amount=amount;p.method=input.method();p.kind=input.kind();p.reason=text(input.reason(),"Descrição");p.requestKey=key;p.createdBy=actor;p.createdAt=LocalDateTime.now();payments.save(p);
        if(a!=null) {
            int points=amount.intValue();if(points>0){LoyaltyMovement l=new LoyaltyMovement();l.tenantId=tenant;l.customerId=a.getCustomerId();l.points=points;l.reason="Pagamento de atendimento";l.paymentId=p.id;l.requestKey="payment:"+p.id;l.createdBy=actor;l.createdAt=p.createdAt;loyalty.save(l);}
        }
        event(tenant,actor,"PAYMENT_"+p.kind,p.id);return p;
    }
    public Payment reverse(UUID tenant,UUID actor,UUID id,String reason) {
        lock(tenant);Payment original=payments.findById(id).filter(p->tenant.equals(p.tenantId)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Movimento não encontrado"));
        require(original.reversalOf==null,"Não é possível estornar um estorno");
        require(payments.findAllByTenantId(tenant).stream().noneMatch(p->id.equals(p.reversalOf)),"Movimento já estornado");
        CashRegister r=open(tenant);BigDecimal amount=original.amount.negate();
        if("CASH".equals(original.method)&&amount.signum()<0)require(cashBalance(tenant,r).add(amount).signum()>=0,"Saldo insuficiente para estorno");
        Payment p=new Payment();p.tenantId=tenant;p.registerId=r.id;p.appointmentId=original.appointmentId;p.amount=amount;p.method=original.method;p.kind="REVERSAL";p.reversalOf=id;p.reason=text(reason,"Motivo");p.requestKey="reversal:"+id;p.createdBy=actor;p.createdAt=LocalDateTime.now();payments.save(p);
        for(LoyaltyMovement source:loyalty.findAllByTenantId(tenant).stream().filter(l->id.equals(l.paymentId)).toList()) {
            LoyaltyMovement l=new LoyaltyMovement();l.tenantId=tenant;l.customerId=source.customerId;l.points=-source.points;l.reason="Estorno de pagamento";l.paymentId=p.id;l.requestKey="reversal:"+source.id;l.createdBy=actor;l.createdAt=p.createdAt;loyalty.save(l);
        }
        if(original.productId!=null){StockMovement m=new StockMovement();m.tenantId=tenant;m.productId=original.productId;m.quantity=original.quantity;m.kind="SALE_REVERSAL";m.reason=p.reason;m.requestKey="payment-reversal:"+id;m.createdBy=actor;m.createdAt=p.createdAt;stock.save(m);}
        event(tenant,actor,"PAYMENT_REVERSE",id);return p;
    }
    public record ProductSaleInput(UUID productId,Integer quantity,String method,String reason,String requestKey) {}
    public Payment sell(UUID tenant,UUID actor,ProductSaleInput input){
        lock(tenant);String key=text(input.requestKey(),"Identificador");
        var previous=payments.findAllByTenantId(tenant).stream().filter(p->key.equals(p.requestKey)).findFirst();
        if(previous.isPresent()) {Payment p=previous.get();if(!Objects.equals(p.productId,input.productId())||!Objects.equals(p.quantity,input.quantity())||!Objects.equals(p.method,input.method())||!Objects.equals(p.reason,input.reason()==null?null:input.reason().trim())) throw new ResponseStatusException(HttpStatus.CONFLICT,"Identificador já usado para outra venda");return p;}
        require(input.productId()!=null,"Selecione o produto");Product product=products.findById(input.productId()).filter(p->tenant.equals(p.tenantId)&&p.active).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Produto não encontrado"));
        require(input.quantity()!=null&&input.quantity()>0&&input.quantity()<=1000000,"Quantidade inválida");
        require(Set.of("CASH","PIX","CARD").contains(input.method()==null?"":input.method()),"Meio inválido");
        long balance=stock.findAllByTenantId(tenant).stream().filter(m->product.id.equals(m.productId)).mapToLong(m->m.quantity).sum();require(balance>=input.quantity(),"Estoque insuficiente");
        CashRegister register=open(tenant);Payment payment=new Payment();payment.tenantId=tenant;payment.registerId=register.id;payment.productId=product.id;payment.quantity=input.quantity();payment.amount=money(product.price.multiply(BigDecimal.valueOf(input.quantity())),true);payment.method=input.method();payment.kind="PRODUCT_SALE";payment.reason=text(input.reason(),"Descrição");payment.requestKey=key;payment.createdBy=actor;payment.createdAt=LocalDateTime.now();payments.save(payment);
        StockMovement move=new StockMovement();move.tenantId=tenant;move.productId=product.id;move.quantity=-input.quantity();move.kind="SALE";move.reason="Venda "+payment.id;move.requestKey="sale:"+payment.id;move.createdBy=actor;move.createdAt=payment.createdAt;stock.save(move);event(tenant,actor,"PRODUCT_SALE",payment.id);return payment;
    }
    public record ProductInput(String name,String sku,String category,String supplier,BigDecimal cost,BigDecimal price,Integer minimumStock) {}
    public Product createProduct(UUID tenant,UUID actor,ProductInput input) {
        lock(tenant);String sku=input.sku()==null||input.sku().isBlank()?null:text(input.sku(),"SKU");
        require(sku==null||products.findAllByTenantId(tenant).stream().noneMatch(p->sku.equalsIgnoreCase(p.sku)),"SKU já cadastrado");
        require(input.minimumStock()!=null&&input.minimumStock()>=0,"Estoque mínimo inválido");
        Product p=new Product();p.tenantId=tenant;p.name=text(input.name(),"Nome");p.sku=sku;p.category=text(input.category(),"Categoria");p.supplier=text(input.supplier(),"Fornecedor");p.cost=money(input.cost(),false);p.price=money(input.price(),false);p.minimumStock=input.minimumStock();p.active=true;products.save(p);event(tenant,actor,"PRODUCT_CREATE",p.id);return p;
    }
    public Map<String,Object> inventory(UUID tenant) {
        List<StockMovement> moves=stock.findAllByTenantId(tenant);Map<UUID,Long> balances=new HashMap<>();for(StockMovement m:moves)balances.merge(m.productId,m.quantity.longValue(),Long::sum);
        return Map.of("products",products.findAllByTenantId(tenant),"movements",moves,"balances",balances);
    }
    public record ProductUpdate(ProductInput product, Boolean active, Long version) {}
    public Product updateProduct(UUID tenant, UUID actor, UUID id, ProductUpdate input) {
        lock(tenant);
        Product product=products.findById(id).filter(p->tenant.equals(p.tenantId))
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Produto não encontrado"));
        if(!Objects.equals(product.version,input.version()))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Produto alterado por outra pessoa; recarregue");
        require(input.product()!=null&&input.active()!=null,"Dados do produto obrigatórios");
        ProductInput data=input.product();
        String sku=data.sku()==null||data.sku().isBlank()?null:text(data.sku(),"SKU");
        require(sku==null||products.findAllByTenantId(tenant).stream().noneMatch(p->!id.equals(p.id)&&sku.equalsIgnoreCase(p.sku)),"SKU já cadastrado");
        require(data.minimumStock()!=null&&data.minimumStock()>=0,"Estoque mínimo inválido");
        product.name=text(data.name(),"Nome");product.sku=sku;product.category=text(data.category(),"Categoria");
        product.supplier=text(data.supplier(),"Fornecedor");product.cost=money(data.cost(),false);product.price=money(data.price(),false);
        product.minimumStock=data.minimumStock();product.active=input.active();
        event(tenant,actor,"PRODUCT_UPDATE",id);return products.save(product);
    }
    public record StockInput(UUID productId,Integer quantity,String kind,String reason,String requestKey) {}
    public StockMovement moveStock(UUID tenant,UUID actor,StockInput input) {
        lock(tenant);String key=text(input.requestKey(),"Identificador");Optional<StockMovement> prior=stock.findAllByTenantId(tenant).stream().filter(m->key.equals(m.requestKey)).findFirst();if(prior.isPresent()) {
            StockMovement previous=prior.get();
            if(!Objects.equals(previous.productId,input.productId()) || input.quantity()==null || Math.abs(previous.quantity)!=input.quantity() || !Objects.equals(previous.kind,input.kind()) || !Objects.equals(previous.reason,input.reason()==null?null:input.reason().trim()))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Identificador já usado para outro movimento");
            return previous;
        }
        require(input.productId()!=null&&products.findById(input.productId()).filter(p->tenant.equals(p.tenantId)).isPresent(),"Produto não encontrado");
        require(input.quantity()!=null&&input.quantity()>0&&input.quantity()<=1000000,"Quantidade inválida");
        require(Set.of("ENTRY","CONSUMPTION","LOSS","ADJUSTMENT_IN","ADJUSTMENT_OUT").contains(input.kind()==null?"":input.kind()),"Tipo de movimento inválido");
        int delta=Set.of("ENTRY","ADJUSTMENT_IN").contains(input.kind())?input.quantity():-input.quantity();
        long balance=stock.findAllByTenantId(tenant).stream().filter(m->input.productId().equals(m.productId)).mapToLong(m->m.quantity).sum();require(balance+delta>=0&&balance+delta<=Integer.MAX_VALUE,"Saldo de estoque inválido");
        StockMovement m=new StockMovement();m.tenantId=tenant;m.productId=input.productId();m.quantity=delta;m.kind=input.kind();m.reason=text(input.reason(),"Motivo");m.requestKey=key;m.createdBy=actor;m.createdAt=LocalDateTime.now();stock.save(m);event(tenant,actor,"STOCK_"+m.kind,m.id);return m;
    }
    public Map<UUID,Map<String,Object>> customerStats(UUID tenant) {
        List<Appointment> all=appointments.findAllByTenantIdAndStartAtLessThanAndEndAtGreaterThan(tenant,LocalDateTime.of(2100,1,1,0,0),LocalDateTime.of(1900,1,1,0,0));
        List<Payment> entries=payments.findAllByTenantId(tenant);Map<UUID,Map<String,Object>> result=new HashMap<>();
        for(var c:customers.findAllByTenantId(tenant,org.springframework.data.domain.Pageable.unpaged())) {
            List<Appointment> completed=all.stream().filter(a->c.getId().equals(a.getCustomerId())&&a.getStatus()==AppointmentStatus.COMPLETED).toList();
            Set<UUID> ids=new HashSet<>();all.stream().filter(a->c.getId().equals(a.getCustomerId())).forEach(a->ids.add(a.getId()));
            Map<String,Object> stats=new HashMap<>();stats.put("visits",completed.size());
            stats.put("lastVisit",completed.stream().map(Appointment::getStartAt).max(Comparator.naturalOrder()).orElse(null));
            stats.put("nextAppointment",all.stream().filter(a->c.getId().equals(a.getCustomerId())&&a.getStartAt().isAfter(LocalDateTime.now())&&Set.of(AppointmentStatus.PENDING,AppointmentStatus.CONFIRMED,AppointmentStatus.CHECKED_IN).contains(a.getStatus())).map(Appointment::getStartAt).min(Comparator.naturalOrder()).orElse(null));
            stats.put("paidAmount",entries.stream().filter(e->ids.contains(e.appointmentId)).map(e->e.amount).reduce(BigDecimal.ZERO,BigDecimal::add));result.put(c.getId(),stats);
        }
        return result;
    }
    public Map<String,Object> mySummary(UUID tenant, UUID actor) {
        var c=customers.findByTenantIdAndUserId(tenant,actor).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente não encontrado"));
        List<LoyaltyMovement> moves=loyalty.findAllByTenantId(c.getTenantId()).stream().filter(l->c.getId().equals(l.customerId)).toList();
        Map<String,Object> result=new HashMap<>(customerStats(c.getTenantId()).get(c.getId()));
        result.put("points",moves.stream().mapToLong(l->l.points).sum());result.put("loyalty",moves);
        result.put("reviews",reviews.findAllByTenantId(c.getTenantId()).stream().filter(r->c.getId().equals(r.customerId)).toList());return result;
    }
    public List<LoyaltyMovement> loyalty(UUID tenant) {return loyalty.findAllByTenantId(tenant);}
    public record RedeemInput(UUID customerId,Integer points,String reason,String requestKey) {}
    public LoyaltyMovement redeem(UUID tenant,UUID actor,RedeemInput input) {
        lock(tenant);customer(tenant,input.customerId());String key=text(input.requestKey(),"Identificador");List<LoyaltyMovement> moves=loyalty.findAllByTenantId(tenant);
        Optional<LoyaltyMovement> prior=moves.stream().filter(l->key.equals(l.requestKey)).findFirst();if(prior.isPresent()) {
            LoyaltyMovement previous=prior.get();
            if(!Objects.equals(previous.customerId,input.customerId()) || input.points()==null || -previous.points!=input.points() || !Objects.equals(previous.reason,input.reason()==null?null:input.reason().trim()))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Identificador já usado para outro resgate");
            return previous;
        }
        require(input.points()!=null&&input.points()>0,"Informe a quantidade de pontos");long balance=moves.stream().filter(l->input.customerId().equals(l.customerId)).mapToLong(l->l.points).sum();require(balance>=input.points(),"Pontos insuficientes");
        LoyaltyMovement l=new LoyaltyMovement();l.tenantId=tenant;l.customerId=input.customerId();l.points=-input.points();l.reason=text(input.reason(),"Recompensa");l.requestKey=key;l.createdBy=actor;l.createdAt=LocalDateTime.now();loyalty.save(l);event(tenant,actor,"LOYALTY_REDEEM",l.id);return l;
    }
    public List<Review> reviews(UUID tenant) {return reviews.findAllByTenantId(tenant);}
    public record ReviewInput(UUID appointmentId,Integer rating,String comment) {}
    public Review review(UUID tenant,UUID actor,ReviewInput input) {
        var c=customers.findByTenantIdAndUserId(tenant,actor).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Cliente não encontrado"));lock(c.getTenantId());
        require(input.appointmentId()!=null,"Informe o atendimento");Appointment a=appointment(c.getTenantId(),input.appointmentId());
        require(a.getCustomerId().equals(c.getId())&&a.getStatus()==AppointmentStatus.COMPLETED,"Somente seus atendimentos concluídos podem ser avaliados");
        require(reviews.findAllByTenantId(c.getTenantId()).stream().noneMatch(r->input.appointmentId().equals(r.appointmentId)),"Atendimento já avaliado");
        require(input.rating()!=null&&input.rating()>=1&&input.rating()<=5,"Nota deve ser de 1 a 5");
        Review r=new Review();r.tenantId=c.getTenantId();r.customerId=c.getId();r.appointmentId=a.getId();r.rating=input.rating();r.comment=text(input.comment(),"Comentário");r.createdAt=LocalDateTime.now();reviews.save(r);event(r.tenantId,actor,"REVIEW_CREATE",r.id);return r;
    }
    public Review reply(UUID tenant,UUID actor,UUID id,String reply) {
        lock(tenant);Review r=reviews.findById(id).filter(v->tenant.equals(v.tenantId)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Avaliação não encontrada"));r.reply=text(reply,"Resposta");reviews.save(r);event(tenant,actor,"REVIEW_REPLY",id);return r;
    }
    public Map<String,Object> crm(UUID tenant) {
        var clients=customers.findAllByTenantId(tenant,org.springframework.data.domain.Pageable.unpaged()).getContent();
        var appts=appointments.findAllByTenantIdAndStartAtLessThanAndEndAtGreaterThan(tenant,LocalDateTime.now(),LocalDateTime.now().minusDays(60));
        Set<UUID> recent=new HashSet<>();appts.stream().filter(a->a.getStatus()==AppointmentStatus.COMPLETED).forEach(a->recent.add(a.getCustomerId()));
        return Map.of("campaigns",campaigns.findAllByTenantId(tenant),"birthdayCustomerIds",clients.stream().filter(c->c.getBirthDate()!=null&&c.getBirthDate().getMonth()==LocalDate.now().getMonth()).map(c->c.getId()).toList(),"inactiveCustomerIds",clients.stream().filter(c->!recent.contains(c.getId())).map(c->c.getId()).toList());
    }
    public record CampaignInput(String name,String segment,String message) {}
    public Campaign campaign(UUID tenant,UUID actor,CampaignInput input) {
        lock(tenant);require(Set.of("BIRTHDAY_MONTH","INACTIVE_60_DAYS").contains(input.segment()==null?"":input.segment()),"Segmento inválido");
        Campaign c=new Campaign();c.tenantId=tenant;c.name=text(input.name(),"Nome");c.segment=input.segment();c.message=text(input.message(),"Mensagem");c.status="DRAFT";c.createdAt=LocalDateTime.now();campaigns.save(c);event(tenant,actor,"CAMPAIGN_DRAFT",c.id);return c;
    }
}
