<script lang="ts" setup>
import { ref } from "vue";
import type { Role } from "@/types/discord";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useForm } from "vee-validate";

const errorMessage = ref("");
const roles = ref<{ label: string; value: string }[]>([]);
const loading = ref(true);

const formSchema = toTypedSchema(
  zod.object({
    message_link: zod.string().min(1),
    emoji: zod.string().min(1),
    role_id: zod.string().min(1),
  }),
);

const { handleSubmit, setErrors, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const save = handleSubmit(async (values) => {
  errorMessage.value = "";

  const { error } = await useApi("/reaction-role", {
    method: "post",
    body: values,
  });

  if (error.value) {
    errorMessage.value = error.value.data.message;
    setErrors(error.value.data.errors ?? []);
  } else {
    navigateTo("/reaction-role");
  }
});

const loadRole = async () => {
  const { data } = await useApi<Role[]>("/discord/roles", {
    method: "get",
  });

  roles.value =
    data.value?.map((role) => ({
      label: role.name,
      value: role.id,
    })) ?? ([] as { label: string; value: string }[]);
};

onMounted(async () => {
  loading.value = true;
  await loadRole();
  loading.value = false;
});

useHead({
  title: "Create Reaction role",
});
</script>

<template>
  <div class="flex grow">
    <div v-if="loading" class="flex grow items-center justify-center">
      <Spinner />
    </div>
    <div v-else class="w-full">
      <p class="mb-8 text-2xl">Create Reaction role</p>
      <form class="grid grid-cols-1 gap-4" @submit.prevent="save">
        <FieldInput name="message_link" label="Message link" />

        <FieldInput name="emoji" label="Emoji" />

        <FieldSelect :items="roles" name="role_id" label="Role" />

        <div>
          <Button
            :disabled="isSubmitting"
            :loading="isSubmitting"
            class="mr-2 px-4"
            size="md"
            type="submit"
          >
            Save
          </Button>
          <span v-if="errorMessage" class="text-red-600">{{
            errorMessage
          }}</span>
        </div>
      </form>
    </div>
  </div>
</template>
