import { CreateVideoFormData } from './form-validation-schema'

/**
 * Default values for the CreateVideoForm
 * These are used as initial values when the form is initialized
 */
export const createVideoFormDefaultValues: CreateVideoFormData = {
  prompt: 'Shawheen V1',
  avatar: '',
  name: '',
  position: '',
  companyName: '',
  license: '',
  tailoredFit: '',
  socialHandles: '',
  videoTopic: '',
  topicKeyPoints: '',
  city: '',
  preferredTone: '',
  callToAction: '',
  email: '',
  preset: '',
  voice: '',
  music: '',
  language: '',
  gender: ''
}

