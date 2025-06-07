package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.converter

import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatus
import org.springframework.data.convert.WritingConverter
import org.springframework.data.r2dbc.convert.EnumWriteSupport

@WritingConverter
class SubscriberStatusWriterConverter : EnumWriteSupport<SubscriberStatus>()
