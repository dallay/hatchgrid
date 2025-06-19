package com.hatchgrid.thryve.form.domain.dto

/**
 * Represents the configuration for styling a form in the Hatchgrid application.
 *
 * @property name The name of the form style configuration.
 * @property header The header text displayed on the form.
 * @property description A brief description of the form.
 * @property inputPlaceholder The placeholder text for input fields in the form.
 * @property buttonText The text displayed on the form's button.
 * @property buttonColor The color of the form's button.
 * @property backgroundColor The background color of the form.
 * @property textColor The color of the text displayed in the form.
 * @property buttonTextColor The color of the text displayed on the form's button.
 */
data class FormStyleConfiguration(
    val name: String, // Name of the form style configuration
    val header: String, // Header text displayed on the form
    val description: String, // Description of the form
    val inputPlaceholder: String, // Placeholder text for input fields
    val buttonText: String, // Text displayed on the button
    val buttonColor: String, // Color of the button
    val backgroundColor: String, // Background color of the form
    val textColor: String, // Text color in the form
    val buttonTextColor: String // Text color on the button
)
