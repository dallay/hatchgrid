<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { h } from 'vue'
import * as z from 'zod'
import type { HTMLAttributes } from 'vue'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'
import {
  ctaEmailVariants,
  ctaEmailInputVariants,
  ctaEmailButtonVariants,
  type CTAEmailVariants,
  type CTAEmailInputVariants,
  type CTAEmailButtonVariants
} from '@/components/cta-email'

// Define props interface
interface Props {
  emailPlaceholder: string;
  buttonText: string;
  size?: CTAEmailVariants['size'];
  alignment?: CTAEmailVariants['alignment'];
  inputVariant?: CTAEmailInputVariants['variant'];
  inputSize?: CTAEmailInputVariants['size'];
  buttonVariant?: CTAEmailButtonVariants['variant'];
  buttonSize?: CTAEmailButtonVariants['size'];
  class?: HTMLAttributes['class'];
  inputClass?: HTMLAttributes['class'];
  buttonClass?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  alignment: 'center',
  inputVariant: 'default',
  inputSize: 'default',
  buttonVariant: 'default',
  buttonSize: 'default',
});

const formSchema = toTypedSchema(z.object({
  email: z.string().email({ message: "Invalid email address. Please enter a valid email." }),
}))

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  toast({
    title: 'Email Submitted!',
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
  // Here you would typically send the email to your backend
  console.log('Email submitted:', values.email);
})
</script>

<template>
  <form
    :class="cn(ctaEmailVariants({ size, alignment }), props.class)"
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="email">
      <FormItem class="w-full sm:w-auto sm:flex-1 sm:max-w-md">
        <label for="email-hero" class="sr-only">{{ props.emailPlaceholder }}</label>
        <FormControl>
          <Input
            id="email-hero"
            type="email"
            :placeholder="props.emailPlaceholder"
            v-bind="componentField"
            :class="cn(ctaEmailInputVariants({ variant: inputVariant, size: inputSize }), props.inputClass)"
            required
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button
      type="submit"
      :class="cn(ctaEmailButtonVariants({ variant: buttonVariant, size: buttonSize }), props.buttonClass)"
    >
      {{ props.buttonText }}
    </Button>
  </form>
</template>
