import { Schema } from 'mongoose';
import { getTenantContext } from './tenant-context';

export interface TenantFilterOptions {
  modelAllowList?: string[];
  companyField?: string;
}

export function tenantFilterPlugin(schema: Schema, options: TenantFilterOptions = {}) {
  const companyField = options.companyField ?? 'company';
  const allowList = options.modelAllowList ?? [];
  const hasCompanyField = !!schema.path(companyField);

  const shouldApplyToModel = (modelName?: string) => {
    if (!hasCompanyField) return false;
    if (!allowList.length) return true;
    return !!modelName && allowList.includes(modelName);
  };

  const applyCompanyFilter = function applyCompanyFilter(this: any) {
    const store = getTenantContext();
    if (!store?.companyId || store?.isKaeyrosUser) return;

    const modelName = this?.model?.modelName;
    if (!shouldApplyToModel(modelName)) return;

    const filter = typeof this.getFilter === 'function' ? this.getFilter() : {};
    if (filter && Object.prototype.hasOwnProperty.call(filter, companyField)) {
      return;
    }

    this.where({ [companyField]: store.companyId });
  };

  schema.pre('find', applyCompanyFilter);
  schema.pre('findOne', applyCompanyFilter);
  schema.pre('findOneAndUpdate', applyCompanyFilter);
  schema.pre('findOneAndDelete', applyCompanyFilter);
  schema.pre('updateOne', applyCompanyFilter);
  schema.pre('updateMany', applyCompanyFilter);
  schema.pre('deleteOne', applyCompanyFilter);
  schema.pre('deleteMany', applyCompanyFilter);
  schema.pre('countDocuments', applyCompanyFilter);

  schema.pre('aggregate', function applyCompanyFilterToAggregate(this: any) {
    const store = getTenantContext();
    if (!store?.companyId || store?.isKaeyrosUser) return;

    const modelName = this?.model?.modelName;
    if (!shouldApplyToModel(modelName)) return;

    const pipeline = this.pipeline();
    const hasMatch = pipeline.some(
      (stage: any) =>
        stage?.$match && Object.prototype.hasOwnProperty.call(stage.$match, companyField)
    );

    if (!hasMatch) {
      pipeline.unshift({ $match: { [companyField]: store.companyId } });
    }
  });
}
