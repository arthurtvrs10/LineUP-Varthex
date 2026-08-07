package com.backend.barbershops;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BarbershopService {
    private final BarbershopRepository barbershopRepository;

    public BarbershopService(BarbershopRepository barbershopRepository) {
        this.barbershopRepository = barbershopRepository;
    }

    public Barbershop createBarbershop(
            String name,
            BusinessDocumentType documentType,
            String documentNumber,
            String phone,
            String email,
            String timezone
    ){
        if(name == null || documentType == null || documentNumber == null || phone == null || email == null ||  timezone == null){
            throw new RuntimeException("Dados obrigatórios faltando");
        }

        if(barbershopRepository.existsByEmail(email)){
            throw new RuntimeException("E-mail já cadastraddo para outra barbearia");
        }

        if (barbershopRepository.existsByDocumentNumber(documentNumber)){
            throw new RuntimeException("Documento já registrado");
        }

        Barbershop barbershop = new Barbershop(
                UUID.randomUUID(),
                name,
                documentType,
                documentNumber,
                phone,
                email,
                BarbershopStatus.TRIAL,
                timezone,
                null,
                null
        );
        return barbershopRepository.save(barbershop);
    }

    public List<Barbershop> listBarbershops(){
        return barbershopRepository.findAll();
    }

    public Barbershop findById(UUID id){
        return barbershopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbearia não encontrada"));
    }

    public Barbershop blockBarbershop(UUID id){
        Barbershop barbershop = findById(id);
        barbershop.setStatus(BarbershopStatus.BLOCKED);
        return barbershopRepository.save(barbershop);
    }

    public Barbershop activateBarbershop(UUID id){
        Barbershop barbershop = findById(id);
        barbershop.setStatus(BarbershopStatus.ACTIVE);
        return barbershopRepository.save(barbershop);
    }

    public Barbershop updateBarbershop(
            UUID id,
            String name,
            String phone,
            String email,
            String timezone
    ) {
        Barbershop barbershop = findById(id);

        if(name != null) {
            barbershop.setName(name);
        }

        if(phone != null) {
            barbershop.setPhone(phone);
        }

        if (email != null && !email.equals(barbershop.getEmail())) {
            if(barbershopRepository.existsByEmail(email)) {
                throw new RuntimeException("E-mail já cadastrado em outra barbearia");
            }

            barbershop.setEmail(email);
        }

        if(timezone != null){
            barbershop.setTimezone(timezone);
        }

        return barbershopRepository.save(barbershop);
    }

}
