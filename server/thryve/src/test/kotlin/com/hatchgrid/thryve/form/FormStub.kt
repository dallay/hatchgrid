package com.hatchgrid.thryve.form

import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.pagination.TimestampCursor
import com.hatchgrid.thryve.GeneralStub.getTimestampCursorPage
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.HexColor
import com.hatchgrid.thryve.form.domain.dto.FormConfiguration
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import java.time.LocalDateTime
import java.util.*
import net.datafaker.Faker

object FormStub {
    private val faker = Faker()

    fun create(
        id: String = UUID.randomUUID().toString(),
        dto: FormConfiguration = FormConfiguration(
            name = faker.lorem().words(3).joinToString(" "),
            header = faker.lorem().words(3).joinToString(" "),
            description = faker.lorem().words(10).joinToString(" "),
            inputPlaceholder = faker.lorem().words(3).joinToString(" "),
            buttonText = faker.lorem().words(3).joinToString(" "),
            buttonColor = faker.color().hex(),
            backgroundColor = faker.color().hex(),
            textColor = faker.color().hex(),
            buttonTextColor = faker.color().hex(),
        ),
        workspaceId: String = UUID.randomUUID().toString(),
    ): Form = create(
        id = FormId(id), dto = dto, workspaceId = WorkspaceId(workspaceId),
    )

    fun create(
        id: FormId = FormId.create(),
        dto: FormConfiguration = FormConfiguration(
            name = faker.lorem().words(3).joinToString(" "),
            header = faker.lorem().words(3).joinToString(" "),
            description = faker.lorem().words(10).joinToString(" "),
            inputPlaceholder = faker.lorem().words(3).joinToString(" "),
            buttonText = faker.lorem().words(3).joinToString(" "),
            buttonColor = faker.color().hex(),
            backgroundColor = faker.color().hex(),
            textColor = faker.color().hex(),
            buttonTextColor = faker.color().hex(),
        ),
        workspaceId: WorkspaceId = WorkspaceId.create(),
        createdAt: LocalDateTime = LocalDateTime.now(),
        updatedAt: LocalDateTime = LocalDateTime.now(),
    ): Form = Form(
        id = id,
        name = dto.name,
        header = dto.header,
        description = dto.description,
        inputPlaceholder = dto.inputPlaceholder,
        buttonText = dto.buttonText,
        buttonColor = HexColor(dto.buttonColor),
        backgroundColor = HexColor(dto.backgroundColor),
        textColor = HexColor(dto.textColor),
        buttonTextColor = HexColor(dto.buttonTextColor),
        workspaceId = workspaceId,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )

    @Suppress("MultilineRawStringIndentation")
    fun generateRequest(
        formConfiguration: FormConfiguration = FormConfiguration(
            name = faker.lorem().words(3).joinToString(" "),
            header = faker.lorem().words(3).joinToString(" "),
            description = faker.lorem().words(10).joinToString(" "),
            inputPlaceholder = faker.lorem().words(3).joinToString(" "),
            buttonText = faker.lorem().words(3).joinToString(" "),
            buttonColor = faker.color().hex(),
            backgroundColor = faker.color().hex(),
            textColor = faker.color().hex(),
            buttonTextColor = faker.color().hex(),
        )
    ): String = """
      {
        "name": "${formConfiguration.name}",
        "header": "${formConfiguration.header}",
        "description": "${formConfiguration.description}",
        "inputPlaceholder": "${formConfiguration.inputPlaceholder}",
        "buttonText": "${formConfiguration.buttonText}",
        "buttonColor": "${formConfiguration.buttonColor}",
        "backgroundColor": "${formConfiguration.backgroundColor}",
        "textColor": "${formConfiguration.textColor}",
        "buttonTextColor": "${formConfiguration.buttonTextColor}"
      }
    """.trimIndent()

    fun dummyRandomFormPageResponse(size: Int): CursorPageResponse<FormResponse> {
        val data = (1..size).map { FormResponse.from(create(id = FormId.create())) }
        val (startCursor, endCursor) = getStartAndEndTimestampCursorPage(data)
        return CursorPageResponse(
            data = data,
            prevPageCursor = startCursor,
            nextPageCursor = endCursor,
        )
    }

    private fun getStartAndEndTimestampCursorPage(data: List<FormResponse>): Pair<String, String> {
        val startCreatedAt = data.first().createdAt
        val startCursor = startCreatedAt?.let { getTimestampCursorPage(it) }
            ?: TimestampCursor.DEFAULT_CURSOR.serialize()
        val lastCreatedAt = data.last().createdAt
        val endCursor = lastCreatedAt?.let { getTimestampCursorPage(it) }
            ?: TimestampCursor.DEFAULT_CURSOR.serialize()
        return Pair(startCursor, endCursor)
    }

    fun dummyRandomFormsPageResponse(size: Int): CursorPageResponse<Form> {
        val data = (1..size).map { generateRandomForm() }
        val nextCursor = TimestampCursor(data.last().createdAt).serialize()
        val prevCursor = TimestampCursor(data.first().createdAt).serialize()
        return CursorPageResponse(
            data = data,
            prevPageCursor = prevCursor,
            nextPageCursor = nextCursor,
        )
    }

    fun generateRandomForm(): Form = create(id = FormId.create())
}
