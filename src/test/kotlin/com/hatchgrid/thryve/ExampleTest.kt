package com.hatchgrid.thryve

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import

@Import(TestcontainersConfiguration::class)
@SpringBootTest
class ExampleTest {

    @Test
    fun `simple addition test`() {
        // A simple test to demonstrate testing
        val result = 2 + 2
        assertEquals(4, result, "2 + 2 should equal 4")
        println("[DEBUG_LOG] Simple addition test passed: 2 + 2 = ${result}")
    }
}
