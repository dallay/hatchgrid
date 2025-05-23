package com.hatchgrid.thryve

import com.hatchgrid.IntegrationTest
import com.hatchgrid.spring.boot.bus.event.EventConfiguration
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

@IntegrationTest
internal class HatchgridApplicationTests {
    @Suppress("UnusedPrivateProperty")
    @Autowired
    private lateinit var eventConfiguration: EventConfiguration
    @Test
    fun should_load_context() = Unit
}
