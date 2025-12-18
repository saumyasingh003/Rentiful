"use client";

import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
  useFieldArray,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, X, Plus } from "lucide-react";
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";

import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview
);

/* ===================== Types ===================== */

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "textarea"
    | "number"
    | "select"
    | "switch"
    | "password"
    | "file"
    | "multi-input";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  multiple?: boolean;
  isIcon?: boolean;
  initialValue?: any;
}

/* ===================== Component ===================== */

export const CustomFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  accept,
  className,
  inputClassName,
  labelClassName,
  disabled = false,
  multiple = false,
  isIcon = false,
  initialValue,
}) => {
  const { control } = useFormContext<FieldValues>();

  const renderFormControl = (
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...field}
            rows={3}
            placeholder={placeholder}
            className={`border-gray-200 p-4 ${inputClassName}`}
          />
        );

      case "select":
        return (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className={`p-4 ${inputClassName}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <FormLabel className={labelClassName}>{label}</FormLabel>
          </div>
        );

      case "file":
        return (
          <FilePond
            files={field.value || []}
            onupdatefiles={(items) =>
              field.onChange(items.map((item) => item.file))
            }
            allowMultiple={multiple}
            acceptedFileTypes={accept ? [accept] : undefined}
            credits={false}
            labelIdle={`Drag & Drop or <span class="filepond--label-action">Browse</span>`}
            className={inputClassName}
          />
        );

      case "number":
        return (
          <Input
            {...field}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            className={`p-4 ${inputClassName}`}
          />
        );

      case "multi-input":
        return (
          <MultiInputField
            name={name}
            control={control}
            placeholder={placeholder}
            inputClassName={inputClassName}
          />
        );

      default:
        return (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`p-4 ${inputClassName}`}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={initialValue}
      render={({ field }) => (
        <FormItem className={`relative ${className}`}>
          {type !== "switch" && (
            <div className="flex justify-between items-center mb-1">
              <FormLabel className={labelClassName}>{label}</FormLabel>
              {!disabled && isIcon && type !== "file" && (
                <Edit className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
          <FormControl>{renderFormControl(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

/* ===================== Multi Input ===================== */

interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
  inputClassName?: string;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({
  name,
  control,
  placeholder,
  inputClassName,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className={`flex-1 p-4 ${inputClassName}`}
                />
              </FormControl>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append("")}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};
