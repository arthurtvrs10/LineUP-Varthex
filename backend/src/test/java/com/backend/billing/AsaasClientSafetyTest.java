package com.backend.billing;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class AsaasClientSafetyTest {
    @Test void productionNeverExposesPaymentSimulation() {
        assertThrows(IllegalArgumentException.class,()->new AsaasClient(true,"test-key","production"));
    }
    @Test void keyEnvironmentMismatchFailsWithoutExposingKey() {
        String key="$aact_prod_not-a-real-key";
        var error=assertThrows(IllegalArgumentException.class,()->new AsaasClient(true,key,"sandbox"));
        assertFalse(error.getMessage().contains(key));
        assertThrows(IllegalArgumentException.class,()->new AsaasClient(true,"$aact_hmlg_not-a-real-key","production"));
    }
}
