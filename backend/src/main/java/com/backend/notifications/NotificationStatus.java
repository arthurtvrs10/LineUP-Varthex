package com.backend.notifications;

// Simplificação de escopo: entrega é síncrona, dentro da mesma transação que
// dispara o evento (sem fila/outbox/retry automático neste incremento) — por
// isso só existem estes dois estados finais, sem PENDING/PROCESSING.
public enum NotificationStatus {
    SENT,
    FAILED
}
