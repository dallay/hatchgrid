package com.hatchgrid.spring.boot

import com.hatchgrid.common.domain.bus.HandlerNotFoundException
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.common.domain.bus.query.QueryHandler
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [HatchgridAutoConfiguration::class, TestQueryHandler::class])
class QueryHandlerTest {

    @Autowired
    lateinit var mediator: Mediator

    @Test
    fun `async queryHandler should retrieve result`() = runBlocking {
        val result = mediator.send(TestQuery(1))

        assertTrue {
            result == "hello 1"
        }
    }

    @Test
    fun `should throw exception if given async query does not have handler bean`() {
        val exception = assertFailsWith(HandlerNotFoundException::class) {
            runBlocking {
                mediator.send(NonExistQuery())
            }
        }

        assertNotNull(exception)
        assertEquals(
            "handler could not be found for com.hatchgrid.spring.boot.NonExistQuery",
            exception.message,
        )
    }
}

class NonExistQuery : Query<String>
class TestQuery(val id: Int) : Query<String>

class TestQueryHandler : QueryHandler<TestQuery, String> {
    override suspend fun handle(query: TestQuery): String = "hello " + query.id
}
