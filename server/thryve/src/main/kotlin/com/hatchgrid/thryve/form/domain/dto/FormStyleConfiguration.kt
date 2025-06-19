package com.hatchgrid.thryve.form.domain.dto

import com.hatchgrid.thryve.form.domain.HexColor

/**
 * Represents the configuration for styling a form in the Hatchgrid application.
 *
 * @property name The name of the form style configuration.
 * @property header The header text displayed on the form.
 * @property description A brief description of the form.
 * @property inputPlaceholder The placeholder text for input fields in the form.
 * @property buttonText The text displayed on the form's button.
 * @property buttonColor The color of the form's button in hex format (e.g., "#RRGGBB").
 * @property backgroundColor The background color of the form in hex format (e.g., "#RRGGBB").
 * @property textColor The color of the text displayed in the form in hex format (e.g., "#RRGGBB").
 * @property buttonTextColor The color of the text displayed on the form's button in hex format (e.g., "#RRGGBB").
 */
data class FormStyleConfiguration(
    val name: String,
    val header: String,
    val description: String,
    val inputPlaceholder: String,
    val buttonText: String,
    val buttonColor: String,
    val backgroundColor: String,
    val textColor: String,
    val buttonTextColor: String
) {
    /**
     * Cached HexColor objects that are lazily initialized when needed
     */
    private val validatedColors: Map<String, HexColor> by lazy {
        mapOf(
            "buttonColor" to validateHexColor(buttonColor, "buttonColor"),
            "backgroundColor" to validateHexColor(backgroundColor, "backgroundColor"),
            "textColor" to validateHexColor(textColor, "textColor"),
            "buttonTextColor" to validateHexColor(buttonTextColor, "buttonTextColor"),
        )
    }

    /**
     * Validates that all color properties conform to valid hex color format.
     * This method throws an IllegalArgumentException if any color is invalid.
     */
    fun validateColors() {
        // Accessing the validatedColors property triggers validation
        validatedColors
    }

    /**
     * Returns the map of validated HexColor objects for each color property.
     * Colors are validated on first access and cached.
     * @return A map of HexColor objects for each color property
     */
    fun toHexColors(): Map<String, HexColor> = validatedColors

    /**
     * Validates a hex color and returns the created HexColor object
     * @param color The hex color string to validate
     * @param propertyName The name of the property being validated (for error messages)
     * @return The validated HexColor object
     * @throws IllegalArgumentException if the color is invalid
     */
    private fun validateHexColor(color: String, propertyName: String): HexColor {
        return try {
            HexColor(color)
        } catch (e: IllegalArgumentException) {
            throw IllegalArgumentException("Invalid hex color format for $propertyName: $color", e)
        }
    }
}
