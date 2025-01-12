<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { ReactionRole } from "@/types/reactionRole";
import { PencilIcon, PlusIcon } from "@heroicons/vue/24/solid";
import type { Pagination } from "@/types/table";
import type { PaginatedResponse } from "@/types/response";

const loading = ref(true);
const reactionRoles = ref<ReactionRole[]>([]);
const toDeleteReactionRole = ref();
const deleteDialog = ref(false);
const pagination = ref<Pagination | null>();

const headers = ref([
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Message",
    key: "message_link",
  },
  {
    title: "Role",
    key: "role_name",
  },
  {
    title: "Emoji",
    key: "emoji",
  },
  {
    title: "",
    key: "actions",
  },
]);

const loadReactionRole = async (page = 1) => {
  loading.value = true;
  const { data } = await useApi<PaginatedResponse<ReactionRole[]>>(
    "/reaction-role",
    {
      method: "get",
      query: {
        page_size: 10,
        page,
      },
    },
  );

  if (data.value) {
    reactionRoles.value = data.value.data ?? [];

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
  if (!toDeleteReactionRole.value) {
    return;
  }
  await useApi<Record<string, string>[]>(
    `/reaction-role/${toDeleteReactionRole.value.id}`,
    {
      method: "delete",
    },
  );
  deleteDialog.value = false;
  toDeleteReactionRole.value = undefined;
  await loadReactionRole();
};

const pageChange = (page: number) => {
  loadReactionRole(page);
};

useHead({
  title: "Reaction roles",
});

onMounted(() => {
  loadReactionRole();
});
</script>

<template>
  <div class="w-full">
    <p class="mb-4 flex items-center gap-4 text-2xl">
      Reaction roles
      <NuxtLink to="/reaction-role/create">
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
      :data="reactionRoles"
      :pagination="pagination"
      @page-change="pageChange"
    >
      <template #body-message_link="{ data }">
        <NuxtLink :to="`${data.message_link}`" target="_blank">
          open message
        </NuxtLink>
      </template>
      <template #body-actions="{ data }">
        <div class="flex gap-4">
          <NuxtLink :to="`/reaction-role/edit/${data.id}`">
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
                toDeleteReactionRole = data;
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
          toDeleteReactionRole = undefined;
          deleteDialog = false;
        }
      "
    >
      <template #title>
        <p>Delete</p>
      </template>
      <template #body>
        <p class="mb-2">Delete the Reaction role?</p>
        <p
          class="rounded border border-red-400 bg-red-200 px-4 py-2 text-red-600"
        >
          This Reaction Role will be deleted
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
              toDeleteReactionRole = undefined;
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
