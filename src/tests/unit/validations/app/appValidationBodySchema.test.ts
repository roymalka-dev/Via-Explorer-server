import { appValidationBodySchema } from "../../../../validations/app.validations";
import { AppType } from "../../../../types/app.types";
import * as yup from "yup";

const validData: AppType = {
  id: "app-123",
  name: "MyApp",
  env: "production",
  tenant: "TenantA",
  city: "New York",
  country: "USA",
  region: "NA",
  iosVersion: "1.0.0",
  iosLink: "https://example.com/ios",
  androidLink: "https://example.com/android",
};

describe("appValidationBodySchema", () => {
  it("should validate successfully with valid data", async () => {
    await expect(appValidationBodySchema.validate(validData)).resolves.toEqual(
      validData
    );
  });

  const requiredFields = [
    "id",
    "name",
    "city",
    "country",
    "version",
    "iosLink",
    "androidLink",
  ];
  requiredFields.forEach((field) => {
    it(`should fail validation if '${field}' is missing`, async () => {
      const invalidData: Partial<AppType> = {
        ...validData,
        [field]: undefined,
      };

      await expect(
        appValidationBodySchema.validate(invalidData, { abortEarly: false })
      ).rejects.toThrow(yup.ValidationError);
    });
  });

  it("should fail validation for invalid iosLink", async () => {
    const invalidData: Partial<AppType> = {
      ...validData,
      iosLink: "not-a-valid-url",
    };

    await expect(
      appValidationBodySchema.validate(invalidData, { abortEarly: false })
    ).rejects.toThrow(yup.ValidationError);
  });

  it("should fail validation for invalid androidLink", async () => {
    const invalidData: Partial<AppType> = {
      ...validData,
      androidLink: "not-a-valid-url",
    };

    await expect(
      appValidationBodySchema.validate(invalidData, { abortEarly: false })
    ).rejects.toThrow(yup.ValidationError);
  });
});
