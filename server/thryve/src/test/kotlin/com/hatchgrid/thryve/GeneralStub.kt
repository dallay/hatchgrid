package com.hatchgrid.thryve

import com.hatchgrid.common.domain.presentation.pagination.TimestampCursor
import java.time.LocalDateTime

object GeneralStub {
    fun getTimestampCursorPage(date: LocalDateTime = LocalDateTime.now()): String =
        TimestampCursor(date).serialize()

    fun getTimestampCursorPage(stringDate: String): String =
        getTimestampCursorPage(LocalDateTime.parse(stringDate))
}
