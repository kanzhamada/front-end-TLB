<script lang="ts">
	let { pageName, total, description }: { pageName: string; total?: number; description: string } =
		$props();
</script>

<div class="w-full border-b border-gray-200/60 bg-white">
	<div class="px-6 py-8">
		<div class="flex max-w-full items-center justify-between">
			<div>
				<h1 class="text-3xl font-light tracking-tight text-gray-900">{pageName}</h1>
				<p class="mt-1 text-sm text-gray-500">Manage and track your {pageName}</p>
			</div>
			<div class="flex items-center space-x-3">
				<div class="text-right">
					<div class="text-2xl font-light text-gray-900">{total}</div>
					<div class="text-xs tracking-wide text-gray-500 uppercase">{description}</div>
				</div>
			</div>
		</div>
	</div>
</div>
