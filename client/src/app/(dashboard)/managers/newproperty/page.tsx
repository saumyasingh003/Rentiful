"use client";

import { CustomFormField } from "@/components/FormField";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";
import { PropertyFormData, propertySchema } from "@/app/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/app/state/api";
import {
  AmenityEnum,
  HighlightEnum,
  PropertyTypeEnum,
} from "@/app/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

const NewProperty = () => {
  const [createProperty] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerMonth: 1000,
      securityDeposit: 500,
      applicationFee: 100,
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: "",
      highlights: "",
      beds: 1,
      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (!authUser?.cognitoInfo?.userId) {
      throw new Error("No manager ID found");
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "photoUrls") {
        (value as File[]).forEach((file) =>
          formData.append("photos", file)
        );
      } else {
        formData.append(key, String(value));
      }
    });

    formData.append("managerCognitoId", authUser.cognitoInfo.userId);
    await createProperty(formData);
  };

  return (
    <div className="dashboard-container bg-white text-gray-800">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-10 text-gray-800"
          >
            {/* Basic Information */}
            <section>
              <h2 className="text-lg font-semibold mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <CustomFormField name="name" label="Property Name" />
                <CustomFormField
                  name="description"
                  label="Description"
                  type="textarea"
                />
              </div>
            </section>

            <hr />

            {/* Fees */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold">Fees</h2>
              <CustomFormField
                name="pricePerMonth"
                label="Price per Month"
                type="number"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  name="securityDeposit"
                  label="Security Deposit"
                  type="number"
                />
                <CustomFormField
                  name="applicationFee"
                  label="Application Fee"
                  type="number"
                />
              </div>
            </section>

            <hr />

            {/* Property Details */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField name="beds" label="Beds" type="number" />
                <CustomFormField name="baths" label="Baths" type="number" />
                <CustomFormField
                  name="squareFeet"
                  label="Square Feet"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  name="isPetsAllowed"
                  label="Pets Allowed"
                  type="switch"
                />
                <CustomFormField
                  name="isParkingIncluded"
                  label="Parking Included"
                  type="switch"
                />
              </div>

              <CustomFormField
                name="propertyType"
                label="Property Type"
                type="select"
                options={Object.keys(PropertyTypeEnum).map((type) => ({
                  value: type,
                  label: type,
                }))}
              />
            </section>

            <hr />

            {/* Amenities */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold">
                Amenities & Highlights
              </h2>

              <CustomFormField
                name="amenities"
                label="Amenities"
                type="select"
                options={Object.keys(AmenityEnum).map((a) => ({
                  value: a,
                  label: a,
                }))}
              />

              <CustomFormField
                name="highlights"
                label="Highlights"
                type="select"
                options={Object.keys(HighlightEnum).map((h) => ({
                  value: h,
                  label: h,
                }))}
              />
            </section>

            <hr />

            {/* Photos */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Photos</h2>
              <CustomFormField
                name="photoUrls"
                label="Property Photos"
                type="file"
                accept="image/*"
              />
            </section>

            <hr />

            {/* Address */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold">Address</h2>
              <CustomFormField name="address" label="Address" />
              <div className="flex gap-4">
                <CustomFormField name="city" label="City" className="w-full" />
                <CustomFormField name="state" label="State" className="w-full" />
                <CustomFormField
                  name="postalCode"
                  label="Postal Code"
                  className="w-full"
                />
              </div>
              <CustomFormField name="country" label="Country" />
            </section>

            <Button
              type="submit"
              className="bg-black hover:bg-gray-700 text-white w-full mt-8"
            >
              Create Property
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;
