package com.hatchgrid.thryve.form.infrastructure.persistence

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.exception.FormException
import com.hatchgrid.thryve.form.infrastructure.persistence.mapper.FormMapper.toEntity
import com.hatchgrid.thryve.form.infrastructure.persistence.repository.FormR2dbcRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.dao.DuplicateKeyException
import org.springframework.dao.TransientDataAccessResourceException

@UnitTest
internal class FormStoreR2dbcRepositoryTest {
    private val formR2dbcRepository: FormR2dbcRepository = mockk()
    private val formStoreR2dbcRepository = FormStoreR2dbcRepository(formR2dbcRepository)
    private lateinit var form: Form

    @BeforeEach
    fun setUp() {
        form = FormStub.generateRandomForm()
        coEvery { formR2dbcRepository.save(any()) } returns form.toEntity()
    }

    @Test
    fun `should create form`(): Unit = runBlocking {
        formStoreR2dbcRepository.create(form)
        coVerify(exactly = 1) { formR2dbcRepository.save(any()) }
    }

    @Test
    fun `should handle duplicate form creation gracefully`(): Unit = runBlocking {
        coEvery { formR2dbcRepository.save(any()) } throws DuplicateKeyException("Duplicate key")
        assertThrows<FormException> {
            formStoreR2dbcRepository.create(form)
        }
    }

    @Test
    fun `should handle unexpected error during form creation`(): Unit = runBlocking {
        coEvery { formR2dbcRepository.save(any()) } throws RuntimeException("Unexpected error")
        assertThrows<RuntimeException> {
            formStoreR2dbcRepository.create(form)
        }
    }

    @Test
    fun `should update form`(): Unit = runBlocking {
        formStoreR2dbcRepository.update(form)
        coVerify(exactly = 1) { formR2dbcRepository.save(any()) }
    }

    @Test
    fun `should handle unexpected error during form update`(): Unit = runBlocking {
        coEvery { formR2dbcRepository.save(any()) } throws RuntimeException("Unexpected error")
        assertThrows<RuntimeException> {
            formStoreR2dbcRepository.update(form)
        }
    }

    @Test
    fun `should handle error when the form does not exist`(): Unit = runBlocking {
        coEvery { formR2dbcRepository.save(any()) } throws TransientDataAccessResourceException("Unexpected error")
        assertThrows<FormException> {
            formStoreR2dbcRepository.update(form)
        }
    }

    @Test
    fun `should find form by id`(): Unit = runBlocking {
        coEvery { formR2dbcRepository.findById(any()) } returns form.toEntity()
        val result = formStoreR2dbcRepository.findById(form.id)
        assertNotNull(result)
        assertEquals(form.id, result?.id)
    }

    @Test
    fun `should delete form`(): Unit = runBlocking {
        coEvery { formR2dbcRepository.deleteById(any()) } returns Unit
        formStoreR2dbcRepository.delete(form.id)
        coVerify(exactly = 1) { formR2dbcRepository.deleteById(form.id.value) }
    }
}
