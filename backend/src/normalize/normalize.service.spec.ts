import { Test, TestingModule } from '@nestjs/testing';
import { NormalizeService } from './normalize.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/common';

describe('NormalizeService', () => {
  let service: NormalizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NormalizeService],
      imports: [ConfigModule.forRoot(), HttpModule],
    }).compile();

    service = module.get<NormalizeService>(NormalizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be return ok', async () => {
    const response = await service.normalize('haha haha');
    expect(response.normText).toEqual('ha-ha ha-ha');
  });
});
