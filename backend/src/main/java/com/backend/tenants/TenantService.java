package com.backend.tenants;

import com.backend.tenants.dto.TenantCreateRequest;
import com.backend.tenants.dto.TenantResponse;
import com.backend.tenants.dto.TenantUpdateRequest;
import com.backend.units.Unit;
import com.backend.units.UnitRepository;
import com.backend.units.dto.UnitInputRequest;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.backend.commercial.SubscriptionRepository subscriptions;
    private final boolean billingEnabled;

    public TenantService(TenantRepository tenantRepository,
                          UnitRepository unitRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          com.backend.commercial.SubscriptionRepository subscriptions,
                          @org.springframework.beans.factory.annotation.Value("${asaas.enabled:false}") boolean billingEnabled) {
        this.tenantRepository = tenantRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.subscriptions = subscriptions;
        this.billingEnabled = billingEnabled;
    }

    @Transactional
    public TenantResponse createTenant(TenantCreateRequest request) {
        if (request.admin() == null || request.initialUnit() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Administrador e unidade inicial são obrigatórios"
            );
        }

        if (request.admin().role() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O usuário criado junto com o tenant só pode ter o papel ADMIN"
            );
        }

        if (request.tradeName() == null || request.tradeName().isBlank() || request.tradeName().length() > 120
                || request.admin().fullName() == null || request.admin().fullName().isBlank()
                || request.admin().email() == null || !request.admin().email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || request.initialUnit().name() == null || request.initialUnit().name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe nome da barbearia, administrador, e-mail e unidade válidos");
        }
        try {
            java.time.ZoneId.of(request.defaultTimeZone());
            java.time.ZoneId.of(request.initialUnit().timeZone());
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fuso horário inválido");
        }
        String password = request.admin().password();
        if (password != null && (password.length() < 8 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter ao menos 8 caracteres e no máximo 72 bytes");
        }

        if (userRepository.existsByEmail(request.admin().email())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "E-mail já cadastrado"
            );
        }

        Tenant tenant = new Tenant(
                null,
                request.tradeName(),
                request.legalName(),
                request.document(),
                request.defaultTimeZone(),
                request.locale(),
                request.currency(),
                null,
                null
        );
        tenant = tenantRepository.save(tenant);

        UnitInputRequest unitInput = request.initialUnit();
        Unit unit = new Unit(null, tenant, unitInput.name(), unitInput.timeZone(), unitInput.active());
        unit.setDocument(unitInput.document());
        unit.setEmail(unitInput.email());
        unit.setPhone(unitInput.phone());
        unit.setStreet(unitInput.street());
        unit.setNumber(unitInput.number());
        unit.setComplement(unitInput.complement());
        unit.setDistrict(unitInput.district());
        unit.setCity(unitInput.city());
        unit.setState(unitInput.state());
        if (unitInput.country() != null) {
            unit.setCountry(unitInput.country());
        }
        unitRepository.save(unit);

        // Cadastros públicos definem a senha; convites sem senha usam recuperação de acesso.
        User admin = new User(
                UUID.randomUUID(),
                request.admin().fullName(),
                request.admin().email(),
                passwordEncoder.encode(password == null ? UUID.randomUUID().toString() : password),
                Role.ADMIN,
                UserStatus.ACTIVE,
                tenant.getId(),
                null,
                null,
                null
        );
        userRepository.save(admin);

        if (billingEnabled) {
            var subscription = new com.backend.commercial.Subscription();
            subscription.tenantId = tenant.getId();
            subscription.status = "SUSPENDED";
            subscription.startsOn = java.time.LocalDate.now();
            subscription.endsOn = java.time.LocalDate.now().minusDays(1);
            subscription.reason = "ASAAS";
            subscriptions.save(subscription);
        }

        return toResponse(tenant);
    }

    public TenantResponse getCurrentTenant(UUID tenantId) {
        return toResponse(findById(tenantId));
    }

    public List<TenantResponse> listTenants() {
        return tenantRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TenantResponse updateStatus(UUID tenantId, TenantStatus status) {
        Tenant tenant = findById(tenantId);
        tenant.setStatus(status);
        return toResponse(tenantRepository.save(tenant));
    }

    @Transactional
    public TenantResponse updateCurrentTenant(UUID tenantId, TenantUpdateRequest request) {
        Tenant tenant = findById(tenantId);

        if (!tenant.getVersion().equals(request.version())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O tenant foi modificado por outra requisição; recarregue e tente novamente"
            );
        }

        tenant.setTradeName(request.tradeName());
        tenant.setLegalName(request.legalName());
        tenant.setDocument(request.document());
        tenant.setDefaultTimeZone(request.defaultTimeZone());
        tenant.setEmail(request.email());
        tenant.setPhone(request.phone());

        return toResponse(tenantRepository.save(tenant));
    }

    private Tenant findById(UUID tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tenant não encontrado"
                ));
    }

    private TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getTradeName(),
                tenant.getLegalName(),
                tenant.getDocument(),
                tenant.getStatus(),
                tenant.getDefaultTimeZone(),
                tenant.getLocale(),
                tenant.getCurrency(),
                tenant.getEmail(),
                tenant.getPhone(),
                tenant.getLogoUrl(),
                tenant.getSlug(),
                tenant.getVersion(),
                tenant.getCreatedAt()
        );
    }
}
