package com.hatchgrid.thryve

import com.hatchgrid.UnitTest
import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

@UnitTest
class ExampleTest {

    @Test
    fun simpleAdditionTest() {
        // A simple test to demonstrate testing
        val result = 2 + 2
        assertEquals(4, result, "2 + 2 should equal 4")
    }
}
