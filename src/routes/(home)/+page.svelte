<script>
    // --- Icon Imports ---
    import MapPin from '@lucide/svelte/icons/map-pin';
    import Clock from '@lucide/svelte/icons/clock';
    import Phone from '@lucide/svelte/icons/phone';
    import Eye from '@lucide/svelte/icons/eye';
    import Goal from '@lucide/svelte/icons/goal';

    // --- Component Imports ---
    import * as Accordion from '$lib/components/ui/accordion';
    import {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent
    } from '$lib/components/ui/card';
    
    // --- Our NEW Local Components ---
    // (We will create these in the next step)
    import ScheduleCard from '$lib/components/User/Home/ScheduleCard.svelte';
    import ServiceItem from '$lib/components/User/Home/ServiceItem.svelte';

    // --- Page Data ---
    // Moved from the markup to keep the HTML clean
    const scheduleData = [
        { day: 'Senin', time: 'Off' },
        { day: 'Selasa', time: '17:00 - 21:00' },
        { day: 'Rabu', time: '17:00 - 21:00' },
        { day: 'Kamis', time: '17:00 - 21:00' },
        { day: "Jum'at", time: '17:00 - 21:00' },
        { day: 'Sabtu', time: '17:00 - 21:00' },
        { day: 'Minggu', time: '17:00 - 21:00' }
    ];

    const serviceData = [
        {
            id: '1',
            title: 'Premium Haircut',
            price: 'Rp 45.000',
            description: 'Haircut premium dengan pilihan warna dan keramik yang terbaik'
        },
        {
            id: '2',
            title: 'Classic Haircut',
            price: 'Rp 40.000',
            description: 'Haircut premium dengan pilihan warna dan keramik yang terbaik'
        },
        {
            id: '3',
            title: 'Shave Beard',
            price: 'Rp 15.000',
            description: 'Haircut premium dengan pilihan warna dan keramik yang terbaik'
        }
    ];

    // Note: I've removed the commented-out Google Maps code for clarity.
</script>

<section class="relative h-screen w-full overflow-hidden">
    <div
        class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&q=80&w=1470')] bg-cover bg-center"
    ></div>
    <div class="absolute inset-0 bg-black/60"></div>

    <div
        class="relative z-10 mx-auto flex h-full max-w-5xl flex-col content-center justify-center px-6"
    >
        <p class="mb-4 text-lg text-white/80">Three Lights Barbershop</p>
        <h1
            class="max-w-3xl text-left text-7xl  tracking-tight text-white md:text-9xl lg:text-[152px]"
        >
            “Lights Up <br /> Your Style”
        </h1>
        <div
            class="z-20 mt-10 w-full transform rounded-2xl bg-[#FFFDD0]/90 p-6 shadow-2xl backdrop-blur-md md:w-full"
        >
            <div class="grid gap-6 md:grid-cols-3">
                <Card class="border-0 bg-transparent shadow-none">
                    <CardHeader>
                        <CardTitle class="flex text-lg font-semibold text-gray-800"
                            ><Phone class="mr-3 mt-1 h-5 w-5" />Layanan Pelanggan</CardTitle
                        >
                        <CardDescription class="text-gray-700"> +62 812-3456-7890 </CardDescription>
                    </CardHeader>
                </Card>

                <Card class="border-0 bg-transparent shadow-none">
                    <CardHeader>
                        <CardTitle class="flex text-lg font-semibold text-gray-800"
                            ><MapPin class="mr-3 mt-1 h-5 w-5" />Lokasi Barbershop</CardTitle
                        >
                        <CardDescription class="text-gray-700">
                            Jl. Terusan Sudimoro, Gembrung, Mojolangu
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card class="border-0 bg-transparent shadow-none">
                    <CardHeader>
                        <CardTitle class="flex text-lg font-semibold text-gray-800"
                            ><Clock class="mr-3 mt-1 h-5 w-5" />Jam Operasional</CardTitle
                        >
                        <CardDescription class="text-gray-700"
                            >Selasa - Minggu, 13:00 - 22:00</CardDescription
                        >
                    </CardHeader>
                </Card>
            </div>
        </div>
    </div>
</section>

<section class="bg-[#e8ddd4] py-20">
    <div class="container mx-auto px-4">
        <h2 class="mb-12 text-4xl font-bold text-[#2e6057]">Tentang</h2>

        <div class="grid grid-cols-1 items-center gap-12 md:grid-cols-3">
            <div
                class="aspect-[3/4] overflow-hidden rounded-lg bg-[url('https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687')] bg-cover bg-center"
            ></div>
            <div
                class="aspect-[3/4] overflow-hidden rounded-lg bg-[url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFyYmVyfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600')] bg-cover bg-center"
            ></div>
            <div class="space-y-4 text-gray-700">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris.
                </p>
                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                    nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </p>
            </div>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-1">
            <Card
                class="relative overflow-hidden via-primmary rounded-lg bg-gradient-to-r from-black from-10% via-80% to-primary to-95% p-9
    text-[#e8ddd4]"
            >
                <Eye
                    class="absolute left-[12.5%] top-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30"
                    stroke-width="1"
                />

                <CardHeader class="relative z-10 col-span-1 grid grid-cols-4 items-center">
                    <h3 class="col-span-1 text-center text-4xl">Visi</h3>
                    <p class="col-span-3 text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus repudiandae
                        dignissimos corrupti, architecto, suscipit dolore facilis minus, soluta natus modi
                        dolor reprehenderit cum deleniti. Deleniti minima quis tempora, earum magnam
                        sapiente. Laborum deserunt tempora voluptas? Vitae autem libero dolorem, veritatis
                        unde sint voluptatibus at omnis placeat illo itaque similique earum cum ratione
                        harum consequatur optio odio expedita accusantium, perspiciatis officiis
                        repellendus? Assumenda molestias doloribus asperiores ab, laudantium iste
                        voluptatem.
                    </p>
                </CardHeader>
            </Card>

            <Card
                class="relative overflow-hidden via-primmary rounded-lg bg-gradient-to-l from-black from-10% via-80% to-primary to-95% p-9
    text-[#e8ddd4]"
            >
                <Goal
                    class="absolute left-[87.5%] top-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30"
                    stroke-width="1"
                />
                <CardHeader class="col-span-1 grid grid-cols-4 items-center">
                    <p class="col-span-3 text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus repudiandae
                        dignissimos corrupti, architecto, suscipit dolore facilis minus, soluta natus modi
                        dolor reprehenderit cum deleniti. Deleniti minima quis tempora, earum magnam
                        sapiente. Laborum deserunt tempora voluptas? Vitae autem libero dolorem, veritatis
                        unde sint voluptatibus at omnis placeat illo itaque similique earum cum ratione
                        harum consequatur optio odio expedita accusantium, perspiciatis officiis
                        repellendus? Assumenda molestias doloribus asperiores ab, laudantium iste
                        voluptatem.
                    </p>
                    <h3 class="col-span-1 text-center text-4xl">Misi</h3>
                </CardHeader>
            </Card>
        </div>
    </div>
</section>

<section class="bg-white py-20">
    <div class="container mx-auto px-4">
        <h2 class="mb-8 text-4xl font-bold text-[#2e6057]">Lokasi</h2>

        <div class="mb-8 flex items-start gap-4">
            <MapPin class="mt-1 h-6 w-6 text-[#2e6057]" />
            <p class="text-lg text-[#2e6057]">
                Jl. Terusan Sudimoro, Gembrung, Mojolangu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65142
            </p>
        </div>

        <div class="aspect-video overflow-hidden rounded-lg bg-gray-200">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.664880952302!2d112.62762049999999!3d-7.930025999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd62900086d3bb9%3A0xeabf779c52c82c86!2sThree%20Lights%20Barbershop!5e0!3m2!1sid!2sid!4v1762238470079!5m2!1sid!2sid"
                width="1600"
                height="900"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
    </div>
</section>

<section class="bg-[#e8ddd4] py-20">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
                <h2 class="mb-6 text-3xl font-bold text-[#2e6057]">Jam Operasional</h2>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
                    {#each scheduleData as item}
                        <ScheduleCard {item} />
                    {/each}
                </div>
            </div>

            <div>
                <h2 class="mb-6 text-3xl font-bold text-[#2e6057]">Layanan</h2>

                <Accordion.Root type="multiple" class="w-full space-y-4">
                    {#each serviceData as service}
                        <ServiceItem
                            value={service.id}
                            title={service.title}
                            price={service.price}
                            description={service.description}
                        />
                    {/each}
                </Accordion.Root>
            </div>
        </div>
    </div>
</section>

