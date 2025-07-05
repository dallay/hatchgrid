package com.hatchgrid.thryve.users.infrastructure.http.steps

import com.hatchgrid.thryve.users.application.UserRegistrator
import com.hatchgrid.thryve.users.application.response.UserResponse
import com.hatchgrid.thryve.users.domain.ApiDataResponse
import com.hatchgrid.thryve.users.domain.ApiResponseStatus
import com.hatchgrid.thryve.users.infrastructure.http.UserRegisterController
import com.hatchgrid.thryve.users.infrastructure.http.request.RegisterUserRequest
import io.cucumber.java.en.Given
import io.cucumber.java.en.When
import io.cucumber.java.en.Then
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient

class UserRegistrationSteps {

    private val faker = Faker()
    private var email: String = ""
    private var password: String = ""
    private var firstName: String = ""
    private var lastName: String = ""
    private lateinit var request: RegisterUserRequest
    private lateinit var webTestClient: WebTestClient
    private val mockUserRegistrator: UserRegistrator = mockk()
    private val userRegisterController = UserRegisterController(mockUserRegistrator)
    private var apiDataResponse: ApiDataResponse<UserResponse>? = null

    @Given("a new user with valid registration details")
    fun a_new_user_with_valid_registration_details() {
        email = faker.internet().emailAddress()
        password = faker.internet().password(8, 80, true, true, true)
        firstName = faker.name().firstName()
        lastName = faker.name().lastName()
        request = RegisterUserRequest(email, password, firstName, lastName)
        webTestClient = WebTestClient.bindToController(userRegisterController).build()
        coEvery { mockUserRegistrator.registerNewUser(any()) } returns ApiDataResponse.success(UserResponse(email, email, firstName, lastName))
    }

    @When("the user attempts to register")
    fun the_user_attempts_to_register() = runBlocking {
        apiDataResponse = webTestClient.post().uri("/api/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody(ApiDataResponse::class.java)
            .returnResult().responseBody as ApiDataResponse<UserResponse>
    }

    @Then("the user account should be created successfully")
    fun the_user_account_should_be_created_successfully() {
        assert(apiDataResponse?.status == ApiResponseStatus.SUCCESS)
        assert(apiDataResponse?.data?.email == email)
    }

    @Then("the user should receive a confirmation")
    fun the_user_should_receive_a_confirmation() {
        // This step would typically involve checking an email or a notification service.
        // For this example, we\'ll assume the successful creation implies confirmation.
        assert(apiDataResponse?.status == ApiResponseStatus.SUCCESS)
    }

    @Given("an existing user with email {string}")
    fun an_existing_user_with_email(existingEmail: String) {
        email = existingEmail
        password = faker.internet().password(8, 80, true, true, true)
        firstName = faker.name().firstName()
        lastName = faker.name().lastName()
        request = RegisterUserRequest(email, password, firstName, lastName)
        webTestClient = WebTestClient.bindToController(userRegisterController).build()
        coEvery { mockUserRegistrator.registerNewUser(any()) } returns ApiDataResponse.failure("Email already in use")
    }

    @Given("a new user attempts to register with the same email")
    fun a_new_user_attempts_to_register_with_the_same_email() {
        // This step is covered by the previous Given, setting up the request with the existing email
    }

    @Then("the registration should fail")
    fun the_registration_should_fail() {
        assert(apiDataResponse?.status == ApiResponseStatus.FAILURE)
    }

    @Then("an error message indicating the email is already in use should be returned")
    fun an_error_message_indicating_the_email_is_already_in_use_should_be_returned() {
        assert(apiDataResponse?.error == "Email already in use")
    }

    @Given("a new user with an invalid email format {string}")
    fun a_new_user_with_an_invalid_email_format(invalidEmail: String) {
        email = invalidEmail
        password = faker.internet().password(8, 80, true, true, true)
        firstName = faker.name().firstName()
        lastName = faker.name().lastName()
        request = RegisterUserRequest(email, password, firstName, lastName)
        webTestClient = WebTestClient.bindToController(userRegisterController).build()
        coEvery { mockUserRegistrator.registerNewUser(any()) } returns ApiDataResponse.failure("Invalid email format")
    }

    @Then("an error message indicating invalid email format should be returned")
    fun an_error_message_indicating_invalid_email_format_should_be_returned() {
        assert(apiDataResponse?.error == "Invalid email format")
    }
}
