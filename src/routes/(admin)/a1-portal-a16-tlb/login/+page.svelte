<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
	<Card class="w-full max-w-md shadow-lg">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold text-center">Admin Portal</CardTitle>
			<CardDescription class="text-center">
				Enter your credentials to access the dashboard
			</CardDescription>
		</CardHeader>
		<CardContent>
			<LoginForm 
				actionUrl="?/login" 
				showRegister={false} 
				formError={form?.message}
			/>
		</CardContent>
	</Card>
</div>
