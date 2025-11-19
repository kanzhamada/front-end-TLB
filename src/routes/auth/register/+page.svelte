<script lang="ts">
	import { goto } from '$app/navigation';
	import { register } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	let displayName = $state('');
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let submitting = $state(false);
	let formError = $state<string | null>(null);

	function handleError(message: string) {
		formError = message;
		toast.error(message);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;

		if (password !== confirmPassword) {
			handleError('Konfirmasi kata sandi tidak cocok.');
			return;
		}

		formError = null;
		submitting = true;

		try {
			const response = await register({
				displayName,
				email,
				password,
				phone: phone || undefined
			});

			const success = response.success ?? response.sucess ?? false;

			if (!success || !response.data?.session) {
				handleError(response.message ?? 'Gagal mendaftar. Coba lagi.');
				return;
			}

			authStore.setSession(response.data.session);
			toast.success('Pendaftaran berhasil!');
			await goto('/');
		} catch (error: unknown) {
			const customError = error as { response?: { message?: string } };
			const message = customError?.response?.message ?? 'Tidak dapat mendaftar. Coba lagi.';
			handleError(message);
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
						<h2 class="text-4xl leading-tight font-bold">Mulai Perjalanan Anda</h2>
						<p class="mt-4 max-w-sm text-base text-[#e8ddd4]/80">
							Daftar dan dapatkan pengalaman reservasi barbershop yang mudah, cepat, dan teratur.
						</p>
					</div>
					<div>
						<p class="text-sm tracking-wide text-[#e8ddd4]/60 uppercase">Sudah punya akun?</p>
						<a
							class="mt-2 inline-flex items-center text-lg font-semibold text-[#fcb13f] underline-offset-4 hover:underline"
							href="/auth/login">Masuk</a
						>
					</div>
				</div>
			</div>

			<div class="p-6 md:p-10">
				<Card class="border-0 shadow-none">
					<CardHeader class="space-y-2 p-0">
						<CardTitle class="text-3xl font-semibold text-[#032B24]">Daftar</CardTitle>
						<CardDescription class="text-base text-[#032B24]/70">
							Isikan data diri Anda untuk membuat akun dan mulai melakukan reservasi.
						</CardDescription>
					</CardHeader>

					<CardContent class="space-y-6 px-0 py-6">
						<form class="space-y-6" onsubmit={handleSubmit}>
							<div class="space-y-2">
								<Label for="displayName" class="text-sm font-semibold text-[#032B24]"
									>Nama Lengkap</Label
								>
								<Input
									id="displayName"
									placeholder="Nama Anda"
									bind:value={displayName}
									required
									autocomplete="name"
									disabled={submitting}
									class="bg-[#f5f1ea] text-[#032B24]"
								/>
							</div>

							<div class="space-y-2">
								<Label for="email" class="text-sm font-semibold text-[#032B24]">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="nama@email.com"
									bind:value={email}
									required
									autocomplete="email"
									disabled={submitting}
									class="bg-[#f5f1ea] text-[#032B24]"
								/>
							</div>

							<div class="space-y-2">
								<Label for="phone" class="text-sm font-semibold text-[#032B24]"
									>Nomor Telepon (Opsional)</Label
								>
								<Input
									id="phone"
									type="tel"
									placeholder="08xxxxxxxxxx"
									bind:value={phone}
									autocomplete="tel"
									disabled={submitting}
									class="bg-[#f5f1ea] text-[#032B24]"
								/>
							</div>

							<div class="space-y-2">
								<Label for="password" class="text-sm font-semibold text-[#032B24]">Kata Sandi</Label
								>
								<Input
									id="password"
									type="password"
									placeholder="Minimal 8 karakter"
									bind:value={password}
									required
									autocomplete="new-password"
									minlength={8}
									disabled={submitting}
									class="bg-[#f5f1ea] text-[#032B24]"
								/>
							</div>

							<div class="space-y-2">
								<Label for="confirmPassword" class="text-sm font-semibold text-[#032B24]"
									>Konfirmasi Kata Sandi</Label
								>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Ulangi kata sandi"
									bind:value={confirmPassword}
									required
									minlength={8}
									autocomplete="new-password"
									disabled={submitting}
									class="bg-[#f5f1ea] text-[#032B24]"
								/>
							</div>

							{#if formError}
								<p class="text-sm font-medium text-red-600">{formError}</p>
							{/if}

							<Button
								type="submit"
								class="w-full bg-[#fcb13f] text-[#032B24] hover:bg-[#fcb13f]/90"
								disabled={submitting}
							>
								{submitting ? 'Memproses...' : 'Daftar'}
							</Button>
						</form>
					</CardContent>

					<CardFooter class="flex flex-col items-start gap-2 px-0 py-0">
						<p class="text-sm text-[#032B24]/70">
							Sudah punya akun?
							<a class="text-[#fcb13f] hover:underline" href="/auth/login">Masuk di sini</a>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	</div>
</section>
