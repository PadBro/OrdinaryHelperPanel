<script lang="ts" setup>
import { ref } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useForm } from "vee-validate";
import type { TextChannel } from "@/types/discord";

defineProps<{
  title: string;
}>();

const showSelector = ref(false);
const textChannels = ref<{ label: string; value: string }[]>([]);

const formSchema = toTypedSchema(
  zod.object({
    text_channel: zod.string().min(1),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const select = handleSubmit(async (values) => {
  emit("select", values.text_channel ?? "");
  showSelector.value = false;
});

const getTextChannels = async () => {
  const { data, error } = await useApi<TextChannel[]>(
    "/discord/text-channels",
    {
      method: "get",
    },
  );

  if (error.value) {
    useNotification().error(
      "Could not load text channels!",
      error.value.data.message,
    );
  }

  textChannels.value =
    data.value
      ?.map((channel): { label: string; value: string } => ({
        label: channel.name,
        value: channel.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) ??
    ([] as { label: string; value: string }[]);
};

const openSelector = async () => {
  await getTextChannels();
  showSelector.value = true;
};

const emit = defineEmits<{
  (e: "select", value: string): void;
}>();
</script>

<template>
  <Button size="sm" class="px-2" color="primary" @click="openSelector">
    {{ title }}
  </Button>

  <Dialog v-if="showSelector" @close="showSelector = false">
    <template #title>
      <p>Select Channel</p>
    </template>
    <template #body>
      <p class="mb-2">Please select a channel:</p>
      <FieldSelect
        :items="textChannels"
        name="text_channel"
        label="Text channel"
      />
    </template>
    <template #footer>
      <Button class="ml-4 px-4" size="sm" @click="select"> Select </Button>
      <Button class="px-4" color="gray" size="sm" @click="showSelector = false">
        Cancel
      </Button>
    </template>
  </Dialog>
</template>
