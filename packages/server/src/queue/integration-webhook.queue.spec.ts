import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bull'
import got from 'got'

import { FormService, IntegrationService, SubmissionService } from '@service'
import { IntegrationWebhookQueue } from './integration-webhook.queue'

jest.mock('got')

describe('IntegrationWebhookQueue', () => {
  let service: IntegrationWebhookQueue
  let integrationService: IntegrationService
  let submissionService: SubmissionService
  let formService: FormService

  const mockIntegration = {
    id: 'integration-id',
    attributes: {
      webhook: 'https://example.com/webhook'
    }
  }

  const mockSubmission = {
    id: 'submission-id',
    formId: 'form-id',
    ip: '127.0.0.1',
    answers: [],
    hiddenFields: []
  }

  const mockForm = {
    id: 'form-id',
    name: 'Test Form',
    fields: []
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationWebhookQueue,
        {
          provide: IntegrationService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockIntegration)
          }
        },
        {
          provide: SubmissionService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockSubmission)
          }
        },
        {
          provide: FormService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockForm)
          }
        }
      ]
    }).compile()

    service = module.get<IntegrationWebhookQueue>(IntegrationWebhookQueue)
    integrationService = module.get<IntegrationService>(IntegrationService)
    submissionService = module.get<SubmissionService>(SubmissionService)
    formService = module.get<FormService>(FormService)
  })

  it('should include IP address in webhook payload', async () => {
    const mockJob = {
      data: {
        integrationId: 'integration-id',
        submissionId: 'submission-id'
      }
    } as Job

    await service.callWebhook(mockJob)

    expect(got.post).toHaveBeenCalledWith(
      'https://example.com/webhook',
      {
        json: expect.objectContaining({
          ip: '127.0.0.1'
        })
      }
    )
  })
}) 