package com.backend.billing;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class AsaasClientSafetyTest {
    @Test void productionNeverExposesPaymentSimulation() {
        var client=new AsaasClient(true,"test-key","production");
        assertEquals(404,assertThrows(ResponseStatusException.class,()->client.confirmSandboxPayment("pay_test")).getStatusCode().value());
    }
    @Test void keyEnvironmentMismatchFailsWithoutExposingKey() {
        String key="$aact_prod_not-a-real-key";
        var error=assertThrows(IllegalArgumentException.class,()->new AsaasClient(true,key,"sandbox"));
        assertFalse(error.getMessage().contains(key));
        assertThrows(IllegalArgumentException.class,()->new AsaasClient(true,"$aact_hmlg_not-a-real-key","production"));
    }
}
