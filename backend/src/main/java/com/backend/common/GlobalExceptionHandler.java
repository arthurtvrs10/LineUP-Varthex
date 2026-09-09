package com.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

// Sem isso, um ResponseStatusException lançado direto de um service (o
// padrão usado em quase todo o backend) e não pego por um @ExceptionHandler
// mais específico vira um forward interno pro /error do Spring Boot — que
// reentra na cadeia de filtros do Spring Security como uma nova requisição
// SEM autenticação. Em endpoint público (ex.: POST /tenants), isso faz o
// AuthorizationFilter negar o /error e a resposta real (ex.: 409) sai
// mascarada como 401 "Bearer" do resource server, em vez do status/mensagem
// que o service pretendia devolver.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());

        return ResponseEntity.status(status)
                .body(Map.of(
                        "status", status.value(),
                        "message", exception.getReason() != null ? exception.getReason() : status.getReasonPhrase()
                ));
    }
}
