package com.hatchgrid.thryve.form.domain

import com.hatchgrid.UnitTest
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class HexColorTest {

    @Test
    fun `validates correct hex color`() {
        val hexColor = HexColor("#FFFFFF")
        Assertions.assertEquals("#FFFFFF", hexColor.hex)
    }

    @Test
    fun `validates correct short hex color`() {
        val hexColor = HexColor("#FFF")
        Assertions.assertEquals("#FFF", hexColor.hex)
    }

    @Test
    fun `throws exception for invalid hex color`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("#GGGGGG")
        }
        Assertions.assertEquals("Invalid hexadecimal color code: #GGGGGG", exception.message)
    }

    @Test
    fun `throws exception for invalid short hex color`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("#GGG")
        }
        Assertions.assertEquals("Invalid hexadecimal color code: #GGG", exception.message)
    }

    @Test
    fun `should throw exception when hex color is empty`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("")
        }
        Assertions.assertEquals("Color code cannot be empty", exception.message)
    }

    @Test
    fun `should throw exception when hex color contains invalid characters`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("#ZZZZZZ")
        }
        Assertions.assertEquals("Invalid hexadecimal color code: #ZZZZZZ", exception.message)
    }

    @Test
    fun `should throw exception when short hex color contains invalid characters`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("#ZZZ")
        }
        Assertions.assertEquals("Invalid hexadecimal color code: #ZZZ", exception.message)
    }

    @Test
    fun `should throw exception when hex color is too short`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("#FF")
        }
        Assertions.assertEquals("Invalid hexadecimal color code: #FF", exception.message)
    }

    @Test
    fun `should throw exception when hex color is too long`() {
        val exception = assertThrows<IllegalArgumentException> {
            HexColor("#FFFFFFFF")
        }
        Assertions.assertEquals("Invalid hexadecimal color code: #FFFFFFFF", exception.message)
    }
}
