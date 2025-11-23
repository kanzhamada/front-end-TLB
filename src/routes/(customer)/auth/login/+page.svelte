<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import type { SubmitFunction } from '@sveltejs/kit';

	let submitting = $state(false);
	let formError = $state<string | null>(null);

	function handleError(message: string) {
		formError = message;
		toast.error(message);
	}

	const handleLogin: SubmitFunction = ({ cancel, formData }) => {
		cancel(); // Prevent default form submission
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		
		performLogin(email, password);
	};

	async function performLogin(email: string, password: string) {
		if (submitting) return;

		formError = null;
		submitting = true;

		try {
			console.log('Attempting login with:', { email });

			const response = await login({ email, password });
			console.log('Login response:', response);

			const success = response.success ?? response.sucess ?? false;

			if (!success || !response.data?.session) {
				const errorMessage = response.message ?? 'Gagal masuk. Coba lagi.';
				handleError(errorMessage);
				console.log('Login failed:', response);
				return;
			}

			authStore.setSession(response.data.session);
			toast.success('Berhasil masuk!');
			await goto('/');
		} catch (error) {
			console.error('Login error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message = customError?.response?.message ?? 'Tidak dapat masuk. Coba lagi.';
				handleError(message);
			} else {
				handleError('Tidak dapat masuk. Coba lagi.');
			}
		} finally {
			submitting = false;
		}
	}
</script>

<section class="flex min-h-screen items-center justify-center bg-[#e8ddd4] px-4 py-12">
	<div class="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
		<div class="grid gap-0 md:grid-cols-2">
			<div class="relative hidden overflow-hidden rounded-l-3xl bg-[#032B24] md:block">
				<div
					class="absolute inset-0 bg-[url('/three_lights_barbershop_logo.svg')] bg-contain bg-center bg-no-repeat opacity-10"
				></div>
				<div class="relative flex h-full flex-col justify-between p-10 text-[#e8ddd4]">
					<div>
						<h2 class="text-4xl leading-tight font-bold">Selamat Datang Kembali!</h2>
						<p class="mt-4 max-w-sm text-base text-[#e8ddd4]/80">
							Masuk untuk mengatur reservasi Anda dan nikmati pelayanan terbaik dari Three Lights
							Barbershop.
						</p>
					</div>
					<div>
						<p class="text-sm tracking-wide text-[#e8ddd4]/60 uppercase">Belum punya akun?</p>
						<a
							class="mt-2 inline-flex items-center text-lg font-semibold text-[#fcb13f] underline-offset-4 hover:underline"
							href="/auth/register">Daftar Sekarang</a
						>
					</div>
				</div>
			</div>

			<div class="p-6 md:p-10">
				<Card class="border-0 shadow-none">
					<CardHeader class="space-y-2 p-0">
						<CardTitle class="text-3xl font-semibold text-[#032B24]">Masuk</CardTitle>
						<CardDescription class="text-base text-[#032B24]/70">
							Mohon masukkan email dan kata sandi Anda untuk melanjutkan reservasi.
						</CardDescription>
					</CardHeader>

					<CardContent class="space-y-6 px-0 py-6">
						<LoginForm 
							actionUrl="?/login" 
							showRegister={false} 
							bind:submitting 
							bind:formError 
							enhanceHandler={handleLogin}
						/>
					</CardContent>

					<CardFooter class="flex flex-col items-start gap-2 px-0 py-0">
						<p class="text-sm text-[#032B24]/70">
							Belum punya akun?
							<a class="text-[#fcb13f] hover:underline" href="/auth/register">Daftar sekarang</a>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	</div>
</section>
