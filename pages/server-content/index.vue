<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useForm } from "vee-validate";
import type { ServerContent, ServerContentFilter } from "@/types/serverContent";
import {
  PencilIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
import type { Pagination } from "@/types/table";
import type { PaginatedResponse } from "@/types/response";

const loading = ref(true);
const serverContents = ref<ServerContent[]>([]);
const toDeleteServerContent = ref();
const deleteDialog = ref(false);
const pagination = ref<Pagination | null>();
const filterValues = ref<ServerContentFilter>({
  name: null,
  is_recommended: null,
});

const headers = ref([
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Description",
    key: "description",
  },
  {
    title: "Recommended?",
    key: "is_recommended",
  },
  {
    title: "",
    key: "actions",
  },
]);

const recommendedItems = ref([
  {
    label: "All",
    value: null,
  },
  {
    label: "Recommended",
    value: true,
  },
  {
    label: "Not recommended",
    value: false,
  },
]);

const formSchema = toTypedSchema(
  zod.object({
    name: zod.string().max(128).nullable(),
    is_recommended: zod.boolean().nullable(),
  }),
);

const { handleSubmit } = useForm({
  initialValues: {
    name: "",
    is_recommended: null,
  },
  validationSchema: formSchema,
});

const changeFilter = handleSubmit((values) => {
  filterValues.value = values;
  loadServerContent();
});

const loadServerContent = async (page = 1) => {
  loading.value = true;
  const { data } = await useApi<PaginatedResponse<ServerContent[]>>(
    "/server-content",
    {
      method: "get",
      query: {
        page_size: 10,
        page,
        ...filters.value,
      },
    },
  );

  if (data.value) {
    serverContents.value = data.value.data ?? [];

    pagination.value = {
      total: data.value.total,
      currentPage: data.value.current_page,
      perPage: data.value.per_page,
      from: data.value.from,
      to: data.value.to,
      totalPages: data.value.last_page,
    };
  }

  loading.value = false;
};

const remove = async () => {
  if (!toDeleteServerContent.value) {
    return;
  }
  await useApi(`/server-content/${toDeleteServerContent.value.id}`, {
    method: "delete",
  });
  deleteDialog.value = false;
  toDeleteServerContent.value = undefined;
  await loadServerContent();
};

const pageChange = (page: number) => {
  loadServerContent(page);
};
const truncatedString = (string: string) => {
  return string.length > 100 ? string.substring(0, 100) + "..." : string;
};

const filters = computed(() => {
  const newFilters: Record<string, string | number | boolean | null> = {};

  if (filterValues.value.name) {
    newFilters["filter[name]"] = filterValues.value.name;
  }

  if (filterValues.value.is_recommended !== null) {
    newFilters["filter[is_recommended]"] = filterValues.value.is_recommended;
  }

  return newFilters;
});

const resend = async (channelId: string) => {
  const { data } = await useApi("/server-content/resend", {
    method: "post",
    body: {
      channel_id: channelId,
    },
  });

  if (data.value) {
    useNotification().success(
      "Send Mods and Datapacks",
      "Send Mods and Datapacks successfully",
    );
  }
};

useHead({
  title: "Mods and Datapacks",
});

onMounted(() => {
  loadServerContent();
});
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <p class="text-2xl">Mods and Datapacks</p>
        <NuxtLink to="/server-content/create">
          <Button size="sm" class="px-2" color="primary">
            <span class="flex items-center">
              <PlusIcon class="size-4 mr-2" />
              Create
            </span>
          </Button>
        </NuxtLink>
      </div>
      <div class="flex gap-4">
        <div>
          <TextChannelSelector title="Resend" @select="resend" />
        </div>

        <NuxtLink to="/server-content/message">
          <Button size="sm" class="px-2" color="primary">
            <span class="flex items-center"> Messages </span>
          </Button>
        </NuxtLink>
      </div>
    </div>
    <Table
      :loading="loading"
      :headers="headers"
      :data="serverContents"
      :pagination="pagination"
      @page-change="pageChange"
    >
      <template #search-bar>
        <FieldInput name="name" label="Name" @change="changeFilter" />

        <FieldSelect
          :items="recommendedItems"
          clearable
          name="is_recommended"
          label="Recommended"
          @change="changeFilter"
        />
      </template>
      <template #body-name="{ data }">
        {{ truncatedString(data.name as string) }}
      </template>
      <template #body-description="{ data }">
        {{ truncatedString(data.description as string) }}
      </template>
      <template #body-is_recommended="{ data }">
        <CheckIcon v-if="data.is_recommended" class="size-6 text-green-500" />
        <XMarkIcon v-else class="size-6 text-red-500" />
      </template>
      <template #body-actions="{ data }">
        <div class="flex gap-4">
          <NuxtLink :to="`/server-content/edit/${data.id}`">
            <Button size="sm" class="px-2" color="gray">
              <span class="flex items-center">
                <PencilIcon class="size-4 mr-2" />
                Edit
              </span>
            </Button>
          </NuxtLink>

          <Button
            size="sm"
            class="px-2"
            color="error"
            @click="
              () => {
                toDeleteServerContent = data;
                deleteDialog = true;
              }
            "
          >
            <span class="flex items-center"> Delete </span>
          </Button>
        </div>
      </template>
    </Table>
    <Dialog
      v-if="deleteDialog"
      @close="
        () => {
          toDeleteServerContent = undefined;
          deleteDialog = false;
        }
      "
    >
      <template #title>
        <p>Delete</p>
      </template>
      <template #body>
        <p class="mb-2">
          Delete the Mod/Datapack:
          <span class="font-bold">{{ toDeleteServerContent?.name }}</span>
          ?
        </p>
        <p
          class="rounded border border-red-400 bg-red-200 px-4 py-2 text-red-600"
        >
          This Mod/Datapack will be deleted
        </p>
      </template>
      <template #footer>
        <Button class="ml-4 px-4" color="error" size="sm" @click="remove">
          Delete
        </Button>
        <Button
          class="px-4"
          color="gray"
          size="sm"
          @click="
            () => {
              toDeleteServerContent = undefined;
              deleteDialog = false;
            }
          "
        >
          Cancel
        </Button>
      </template>
    </Dialog>
  </div>
</template>
