package com.hatchgrid.spring.boot

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.RequestHandlerDelegate
import com.hatchgrid.common.domain.bus.command.Command
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.common.domain.bus.pipeline.PipelineBehavior
import kotlin.test.assertTrue
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

var exceptionPipelineBehaviorHandleCounter = 0
var exceptionPipelineBehaviorHandleCatchCounter = 0
var loggingPipelineBehaviorHandleBeforeNextCounter = 0
var loggingPipelineBehaviorHandleAfterNextCounter = 0

@SpringBootTest(
    classes = [
        HatchgridAutoConfiguration::class, MyCommandHandler::class,
        ExceptionPipelineBehavior::class, LoggingPipelineBehavior::class,
    ],
)
class PipelineBehaviorTest {

    init {
        exceptionPipelineBehaviorHandleCounter = 0
        exceptionPipelineBehaviorHandleCatchCounter = 0
        loggingPipelineBehaviorHandleBeforeNextCounter = 0
        loggingPipelineBehaviorHandleAfterNextCounter = 0
    }

    @Autowired
    lateinit var mediator: Mediator

    @Test
    fun `should process command with async pipeline`() {
        runBlocking {
            mediator.send(MyCommand())
        }

        assertTrue { exceptionPipelineBehaviorHandleCatchCounter == 0 }
        assertTrue { exceptionPipelineBehaviorHandleCounter == 1 }
        assertTrue { loggingPipelineBehaviorHandleBeforeNextCounter == 1 }
        assertTrue { loggingPipelineBehaviorHandleAfterNextCounter == 1 }
    }

    @Test
    fun `should process exception in async handler`() {
        val act = suspend { mediator.send(MyBrokenCommand()) }

        assertThrows<Exception> { runBlocking { act() } }

        assertTrue { exceptionPipelineBehaviorHandleCatchCounter == 1 }
        assertTrue { exceptionPipelineBehaviorHandleCounter == 1 }
        assertTrue { loggingPipelineBehaviorHandleBeforeNextCounter == 1 }
        assertTrue { loggingPipelineBehaviorHandleAfterNextCounter == 0 }
    }
}

class MyBrokenCommand : Command

class MyBrokenHandler : CommandHandler<MyBrokenCommand> {
    override suspend fun handle(command: MyBrokenCommand) {
        delay(500)
        @Suppress("TooGenericExceptionThrown")
        throw Exception()
    }
}

private class ExceptionPipelineBehavior : PipelineBehavior {
    override suspend fun <TRequest, TResponse> handle(
        request: TRequest,
        next: RequestHandlerDelegate<TRequest, TResponse>,
    ): TResponse {
        try {
            exceptionPipelineBehaviorHandleCounter++
            return next(request)
        } catch (ex: Exception) {
            exceptionPipelineBehaviorHandleCatchCounter++
            throw ex
        }
    }
}

private class LoggingPipelineBehavior : PipelineBehavior {
    override suspend fun <TRequest, TResponse> handle(
        request: TRequest,
        next: RequestHandlerDelegate<TRequest, TResponse>,
    ): TResponse {
        loggingPipelineBehaviorHandleBeforeNextCounter++
        val result = next(request)
        loggingPipelineBehaviorHandleAfterNextCounter++
        return result
    }
}
