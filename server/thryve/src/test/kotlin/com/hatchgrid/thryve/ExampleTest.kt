package com.hatchgrid.thryve

import com.hatchgrid.UnitTest
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

@UnitTest
class ExampleTest {

    @Test
    fun simpleAdditionTest() {
        // A simple test to demonstrate testing
        val result = 2 + 2
        assertEquals(4, result, "2 + 2 should equal 4")
    }
}
