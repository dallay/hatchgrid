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
     * Validates that all color properties conform to valid hex color format.
     * This method throws an IllegalArgumentException if any color is invalid.
     */
    fun validateColors() {
        validateHexColor(buttonColor, "buttonColor")
        validateHexColor(backgroundColor, "backgroundColor")
        validateHexColor(textColor, "textColor")
        validateHexColor(buttonTextColor, "buttonTextColor")
    }

    /**
     * Converts properties to HexColor objects after validating them.
     * @return A map of HexColor objects for each color property
     */
    fun toHexColors(): Map<String, HexColor> = mapOf(
        "buttonColor" to HexColor(buttonColor),
        "backgroundColor" to HexColor(backgroundColor),
        "textColor" to HexColor(textColor),
        "buttonTextColor" to HexColor(buttonTextColor),
    )

    private fun validateHexColor(color: String, propertyName: String) {
        try {
            HexColor(color)
        } catch (e: IllegalArgumentException) {
            throw IllegalArgumentException("Invalid hex color format for $propertyName: $color", e)
        }
    }
}
