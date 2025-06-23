package com.hatchgrid.thryve.form.infrastructure.persistence.repository

import com.hatchgrid.spring.boot.repository.ReactiveSearchRepository
import com.hatchgrid.thryve.form.infrastructure.persistence.entity.FormEntity
import java.util.*
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface FormR2dbcRepository :
    CoroutineCrudRepository<FormEntity, UUID>,
    ReactiveSearchRepository<FormEntity> {
    suspend fun findByIdAndWorkspaceId(id: UUID, workspaceId: UUID): FormEntity?
}
