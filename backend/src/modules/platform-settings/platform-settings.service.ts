import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSettings } from '../../database/schemas/platform-settings.schema';

@Injectable()
export class PlatformSettingsService {
  constructor(
    @InjectModel(PlatformSettings.name)
    private platformSettingsModel: Model<PlatformSettings>,
  ) {}

  private async getOrCreate(): Promise<PlatformSettings> {
    let settings = await this.platformSettingsModel.findOne({ key: 'platform' }).exec();
    if (!settings) {
      settings = new this.platformSettingsModel({ key: 'platform' });
      await settings.save();
    }
    return settings;
  }

  async getSettings() {
    return this.getOrCreate();
  }

  async updateSettings(update: Partial<PlatformSettings>) {
    const settings = await this.getOrCreate();
    Object.assign(settings, update);
    return settings.save();
  }
}
