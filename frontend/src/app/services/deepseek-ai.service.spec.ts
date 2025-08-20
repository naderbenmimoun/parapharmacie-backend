import { TestBed } from '@angular/core/testing';

import { DeepseekAiService } from './deepseek-ai.service';

describe('DeepseekAiService', () => {
  let service: DeepseekAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeepseekAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
