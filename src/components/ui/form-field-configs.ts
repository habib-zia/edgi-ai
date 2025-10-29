// Form field configurations for CreateVideoForm

export interface FormFieldConfig {
  field: string
  label: string
  placeholder: string
  type?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
}

// Row 2 fields configuration
export const row2Fields: FormFieldConfig[] = [
  {
    field: 'callToAction',
    label: 'Call to Action',
    placeholder: 'e.g. Call for consultation',
    type: 'text',
    required: true
  },
  {
    field: 'license',
    label: 'License',
    placeholder: 'e.g. License #12345',
    type: 'text',
    required: true
  },
  {
    field: 'tailoredFit',
    label: 'Tailored Fit',
    placeholder: 'e.g. First-time buyer specialist',
    type: 'text',
    required: true
  },
  {
    field: 'socialHandles',
    label: 'Social Handles',
    placeholder: 'e.g. @johnsmith, @facebook',
    type: 'text',
    required: true
  }
]

// Row 3 fields configuration
export const row3Fields: FormFieldConfig[] = [
  {
    field: 'city',
    label: 'City',
    placeholder: 'e.g. Los Angeles',
    type: 'text',
    autoComplete: 'address-level2',
    required: true
  },
  {
    field: 'preferredTone',
    label: 'Preferred Tone',
    placeholder: 'e.g. Professional, friendly, etc.',
    type: 'text',
    required: true
  },
  {
    field: 'email',
    label: 'Email',
    placeholder: 'your.email@example.com',
    type: 'email',
    autoComplete: 'email',
    required: true,
    disabled: true
  }
]
