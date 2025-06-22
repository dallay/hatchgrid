package com.hatchgrid.thryve.form.domain

import com.hatchgrid.common.domain.BaseValidateValueObject

/**
 * Value object for hexadecimal color codes that are validated when created
 */
data class HexColor(val hex: String) :
    BaseValidateValueObject<String>(
        hex.takeIf {
            it.isNotBlank()
        }?.let { if (it.startsWith("#")) it else "#$it" }
            ?: throw IllegalArgumentException("Color code cannot be empty"),
    ) {

    /**
     * Validates the value of the value object
     * @param value the value to validate
     */
    override fun validate(value: String) {
        require(value.isNotBlank()) { "Color code cannot be empty" }
        val normalizedHex = if (value.startsWith("#")) value else "#$value"
        require(regex.matches(normalizedHex)) { "Invalid hexadecimal color code: $normalizedHex" }
    }

    /**
     * String representation of the value object
     * @return the string representation of the value object
     */
    override fun toString(): String = value

    companion object {
        /**
         * Regex pattern that matches hex colors:
         * - Optional # prefix
         * - Either 3 or 6 hexadecimal digits (case-insensitive)
         */
        val regex = Regex("^#([0-9a-f]{6}|[0-9a-f]{3})$", RegexOption.IGNORE_CASE)
    }
}
