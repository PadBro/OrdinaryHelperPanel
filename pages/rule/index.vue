<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { Rule } from "@/types/rule";
import { PencilIcon, PlusIcon } from "@heroicons/vue/24/solid";
import type { Pagination } from "@/types/table";
import type { PaginatedResponse } from "@/types/response";

const loading = ref(true);
const rules = ref<Rule[]>([]);
const toDeleteRule = ref();
const deleteDialog = ref(false);
const pagination = ref<Pagination | null>();

const headers = ref([
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Number",
    key: "number",
  },
  {
    title: "Name",
    key: "name",
  },
  {
    title: "",
    key: "actions",
  },
]);

const loadRule = async (page = 1) => {
  loading.value = true;
  const { data } = await useApi<PaginatedResponse<Rule[]>>("/rule", {
    method: "get",
    query: {
      page_size: 10,
      page,
    },
  });

  if (data.value) {
    rules.value = data.value.data ?? [];

    pagination.value = {
      total: data.value.meta.total,
      currentPage: data.value.meta.current_page,
      perPage: data.value.meta.per_page,
      from: data.value.meta.from,
      to: data.value.meta.to,
      totalPages: data.value.meta.last_page,
    };
  }

  loading.value = false;
};

const remove = async () => {
  if (!toDeleteRule.value) {
    return;
  }
  await useApi<Record<string, string>[]>(`/rule/${toDeleteRule.value.id}`, {
    method: "delete",
  });
  deleteDialog.value = false;
  toDeleteRule.value = undefined;
  await loadRule();
};

const pageChange = (page: number) => {
  loadRule(page);
};

useHead({
  title: "Rules",
});

onMounted(() => {
  loadRule();
});
</script>

<template>
  <div class="w-full">
    <p class="mb-4 flex items-center gap-4 text-2xl">
      Rules
      <NuxtLink to="/rule/create">
        <Button size="sm" class="px-2" color="primary">
          <span class="flex items-center">
            <PlusIcon class="size-4 mr-2" />
            Create
          </span>
        </Button>
      </NuxtLink>
    </p>
    <Table
      :loading="loading"
      :headers="headers"
      :data="rules"
      :pagination="pagination"
      @page-change="pageChange"
    >
      <template #body-actions="{ data }">
        <div class="flex gap-4">
          <NuxtLink :to="`/rule/edit/${data.id}`">
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
                toDeleteRule = data;
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
          toDeleteRule = undefined;
          deleteDialog = false;
        }
      "
    >
      <template #title>
        <p>Delete</p>
      </template>
      <template #body>
        <p class="mb-2">
          Delete the Rule:
          <span class="font-bold">{{ toDeleteRule?.name }}</span>
          ?
        </p>
        <p
          class="rounded border border-red-400 bg-red-200 px-4 py-2 text-red-600"
        >
          This Rule will be deleted
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
              toDeleteRule = undefined;
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
