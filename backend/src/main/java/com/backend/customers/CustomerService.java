package com.backend.customers;

import com.backend.customers.dto.CustomerPageResponse;
import com.backend.customers.dto.CustomerRequest;
import com.backend.customers.dto.CustomerResponse;
import com.backend.customers.dto.PageMetaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional
    public CustomerResponse createCustomer(UUID tenantId, CustomerRequest request) {
        validate(request);

        Customer customer = new Customer(
                null,
                tenantId,
                request.fullName(),
                request.email(),
                request.phone(),
                request.birthDate(),
                request.notes()
        );

        return toResponse(customerRepository.save(customer));
    }

    public CustomerPageResponse listCustomers(UUID tenantId, String query, Pageable pageable) {
        Page<Customer> page = (query == null || query.isBlank())
                ? customerRepository.findAllByTenantId(tenantId, pageable)
                : customerRepository.findAllByTenantIdAndFullNameContainingIgnoreCase(tenantId, query, pageable);

        return toPageResponse(page);
    }

    public CustomerResponse getCustomer(UUID tenantId, UUID customerId) {
        return toResponse(findByIdAndTenant(tenantId, customerId));
    }

    @Transactional
    public CustomerResponse updateCustomer(UUID tenantId, UUID customerId, CustomerRequest request) {
        validate(request);

        Customer customer = findByIdAndTenant(tenantId, customerId);

        if (!customer.getVersion().equals(request.version())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O cliente foi modificado por outra requisição; recarregue e tente novamente"
            );
        }

        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setBirthDate(request.birthDate());
        customer.setNotes(request.notes());

        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void archiveCustomer(UUID tenantId, UUID customerId) {
        Customer customer = findByIdAndTenant(tenantId, customerId);
        customer.setStatus(CustomerStatus.ARCHIVED);
        customerRepository.save(customer);
    }

    private Customer findByIdAndTenant(UUID tenantId, UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"
                ));

        if (!customer.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Cliente não encontrado"
            );
        }

        return customer;
    }

    private void validate(CustomerRequest request) {
        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome é obrigatório");
        }

        boolean hasEmail = request.email() != null && !request.email().isBlank();
        boolean hasPhone = request.phone() != null && !request.phone().isBlank();

        if (!hasEmail && !hasPhone) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe e-mail ou telefone"
            );
        }
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getBirthDate(),
                customer.getNotes(),
                customer.getVersion(),
                customer.getStatus(),
                customer.getCreatedAt()
        );
    }

    private CustomerPageResponse toPageResponse(Page<Customer> page) {
        return new CustomerPageResponse(
                page.getContent().stream().map(this::toResponse).toList(),
                new PageMetaResponse(
                        page.getNumber(),
                        page.getSize(),
                        page.getTotalElements(),
                        page.getTotalPages()
                )
        );
    }
}
