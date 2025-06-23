package com.hatchgrid.thryve.form.domain.dto

/**
 * Represents the configuration for a form.
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
data class FormConfiguration(
    val name: String,
    val header: String,
    val description: String,
    val inputPlaceholder: String,
    val buttonText: String,
    val buttonColor: String,
    val backgroundColor: String,
    val textColor: String,
    val buttonTextColor: String,
)
