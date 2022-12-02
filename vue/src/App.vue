<template>
    <div>
        <!-- Search modal -->
        <div id="searchModal" ref="searchModal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
            <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto h-full">
                    <!-- Modal header -->
                    <div class="modal-header">

                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                            <h3 class="w-full text-xl font-semibold text-gray-900 dark:text-white mr-4">
                                <form @submit.prevent="getLists" class="w-full">
                                    <label for="searchModalInput"
                                        class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search
                                        Trakt lists</label>
                                    <div class="relative">
                                        <div
                                            class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                            <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                        <input v-model="state.searchQuery" type="search" id="searchModalInput"
                                            class="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Search Trakt lists" required>
                                        <button type="submit"
                                            class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                                    </div>
                                </form>
                            </h3>
                            <button type="button"
                                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                @click="state.modal.toggle">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd"></path>
                                </svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                    </div>
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">
                        <div class="flex flex-col w-full gap-3 z-10">
                            <div v-for="item in state.searchResults" :key="item.id"
                                class="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {{ item.name }} <small>by {{ item.user }}</small>
                                        <span
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">{{
                                                    item.likes
                                            }}
                                            likes</span>
                                        <span
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">Items
                                            count: {{ item.item_count }}</span>
                                    </h5>
                                </a>
                                <p :id="`${item.id}_less`" class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                    {{ item.description.slice(0, 100) }} <button class="readmore"
                                        @click="readmore(item.id)">read more</button></p>
                                <p :id="`${item.id}_more`"
                                    class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
                                    {{ item.description }} <button class="readless" @click="readless(item.id)">read
                                        less</button></p>
                                <button @click="addList(item)"
                                    class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Add list
                                    <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor"
                                        viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- popular Lists modal -->
        <div id="popularModal" ref="popularModal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
            <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto h-full">
                    <!-- Modal header -->
                    <div class="modal-header">
                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                            <h3 class="w-full text-xl font-semibold text-gray-900 dark:text-white mr-4">Trakt popular
                                Lists
                            </h3>
                            <button @click="state.popularModal.toggle" type="button"
                                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd"></path>
                                </svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                    </div>
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">
                        <div class="flex flex-col w-full gap-3 z-10">
                            <div v-for="item in state.lists_popular" :key="item.id"
                                class="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {{ item.name }} <small>by {{ item.user }}</small>
                                        <span
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">{{
                                                    item.likes
                                            }}
                                            likes</span>
                                        <span
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">Items
                                            count: {{ item.item_count }}</span>
                                    </h5>
                                </a>
                                <p :id="`${item.id}_less`" class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                    {{ item.description.slice(0, 100) }} <button class="readmore"
                                        @click="readmore(item.id)">read more</button></p>
                                <p :id="`${item.id}_more`"
                                    class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
                                    {{ item.description }} <button class="readless" @click="readless(item.id)">read
                                        less</button></p>
                                <button @click="addList(item)"
                                    class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Add list
                                    <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor"
                                        viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- trending Lists modal -->
        <div id="trendingModal" ref="trendingModal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
            <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto h-full">
                    <!-- Modal header -->
                    <div class="modal-header">

                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                            <h3 class="w-full text-xl font-semibold text-gray-900 dark:text-white mr-4">Trakt popular
                                Lists
                            </h3>
                            <button @click="state.trendingModal.toggle" type="button"
                                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd"></path>
                                </svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                    </div>
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">
                        <div class="flex flex-col w-full gap-3 z-10">
                            <div v-for="item in state.lists_trending" :key="item.id"
                                class="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {{ item.name }} <small>by {{ item.user }}</small>
                                        <span
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">{{
                                                    item.likes
                                            }}
                                            likes</span>
                                        <span
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">Items
                                            count: {{ item.item_count }}</span>
                                    </h5>
                                </a>
                                <p :id="`${item.id}_less`" class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                    {{ item.description.slice(0, 100) }} <button class="readmore"
                                        @click="readmore(item.id)">read more</button></p>
                                <p :id="`${item.id}_more`"
                                    class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
                                    {{ item.description }} <button class="readless" @click="readless(item.id)">read
                                        less</button></p>
                                <button @click="addList(item)"
                                    class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Add list
                                    <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor"
                                        viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- install Modal -->
        <div id="installModal" ref='installModal' tabindex="-1" aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center">
            <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <!-- Modal header -->
                    <div class="modal-header">

                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                Install the addon
                            </h3>
                            <button @click="state.install.hide();" type="button"
                                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                data-modal-toggle="defaultModal">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill=""
                                    style="--darkreader-inline-fill:currentColor;">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd"></path>
                                </svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                    </div>
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">
                        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Hello guys, seems like we have reached the end of our journey together, most things are
                            working properly and most features are implemented. a huge thanks to Rab1t for his
                            tremendous help.</p>
                        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            I have decided to drop support for this addon. so now it's up to Rab1t to keep maintaining
                            it or not. otherwise the source code is always available on my github.<br>Peace.</p>
                    </div>
                    <!-- Modal footer -->
                    <div
                        class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                        <a id="install_button" href="#"><button type="button"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Install
                                Addon</button></a>
                        <button type="button" @click="state.install.hide();"
                            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancle</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-img relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gray-500 bg-no-repeat bg-cover bg-center relative items-center"
            :style="`background-image: url(${manifest.background});`">
            <div class="absolute bg-black opacity-60 inset-0 z-0"></div>
            <div class="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl z-10">


                <div class="grid gap-8 grid-cols-1">
                    <div class="flex flex-col ">
                        <div class="items-center header">
                            <img class="logo" :src="manifest.logo">
                            <h1 class="font-semibold text-lg mr-auto">{{ manifest.name }}</h1>
                            <h2 class="font-semibold text-lg mr-auto" style="text-align: right;">Version: {{
                                    manifest.version
                            }}</h2>
                            <p class="mt-5">{{ manifest.description }}</p>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="items-center mt-5 description">
                            <h2 class="font-semibold text-lg mr-auto">This addon has more:</h2>
                            <ul v-html="stylizedTypes.map(t => `<li>${t}</li>`).join('')"></ul>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="mt-10">
                            <span class="text-xs font-semibold text-gray-600 py-2">Add personal lists (requires Trakt
                                login)</span>
                            <div class="mt-5 flex flex-col items-center">
                                <a
                                    :href="`https://trakt.tv/oauth/authorize?client_id=18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281&redirect_uri=${encodeURIComponent(state.currentUrl)}&response_type=code`">
                                    <button type="button" id="Auth"
                                        class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Login
                                        to Trakt.tv</button></a>
                            </div>

                            <div class="flex items-center justify-center space-x-2 mt-5">
                                <span class="h-px w-full bg-gray-200"></span>
                            </div>

                            <div class="flex items-center justify-center space-x-2 mt-5">
                                <button id="generic_Button" ref="generic_Button"
                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    type="button">Generic Lists: <svg aria-hidden="true" class="ml-2 w-4 h-4"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7"></path>
                                    </svg></button>
                            </div>
                            <!-- Dropdown menu -->
                            <div id="generic_Menu" ref="generic_Menu"
                                class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
                                <ul class="py-1 text-sm text-gray-700 dark:text-gray-200"
                                    aria-labelledby="generic_Button" style="width: max-content;">
                                    <li>
                                        <input id="trakt_popular" type="checkbox" checked value="trakt_popular"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="trakt_popular"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Popular</label>
                                    </li>
                                    <li>
                                        <input id="trakt_trending" type="checkbox" checked value="trakt_trending"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="trakt_trending"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Trending</label>
                                    </li>
                                    <li>
                                        <input id="trakt_watchlist" type="checkbox" value="trakt_watchlist"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="trakt_watchlist"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Watch List
                                            (Requires Login)</label>
                                    </li>
                                    <li>
                                        <input id="trakt_rec" type="checkbox" value="trakt_rec"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="trakt_rec"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Recommendations
                                            (Requires Login)</label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <!--                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkRecommendations" disabled>
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Your
                                        Recommendations</span>
                                </label>
                            </div>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkWatchlist" disabled>
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Your
                                        Watchlist</span>
                                </label>
                            </div>
                        </div> -->


                        <!-- <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="mt-10">
                            <span class="text-xs font-semibold text-gray-600 py-2">Add special lists</span>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkTrending" checked>
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Trakt
                                        Trending</span>
                                </label>
                            </div>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkPopular" checked>
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Trakt
                                        Popular</span>
                                </label>
                            </div>
                        </div> -->

                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>


                        <span class="text-xs font-semibold text-gray-600 py-2 mt-10">Add lists</span>

                        <div class="flex rounded-md shadow-sm mt-5 w-full" role="group">
                            <button @click="state.popularModal.show()" type="button"
                                class="grow py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                                Browse popular lists
                            </button>
                            <button @click="state.trendingModal.show()" type="button"
                                class="grow py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                                Browse trending lists
                            </button>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-16 bg-gray-300"></span>
                            <span class="text-gray-400 font-normal">or</span>
                            <span class="h-px w-16 bg-gray-300"></span>
                        </div>

                        <div class="mt-5">
                            <form @submit.prevent="searchLists">
                                <label for="searchInput"
                                    class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search
                                    Trakt lists</label>
                                <div class="relative">
                                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <input v-model="state.searchQuery" type="search" id="searchInput"
                                        class="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Search Trakt lists" required>
                                    <button type="submit"
                                        class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                                </div>
                            </form>

                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-16 bg-gray-300"></span>
                            <span class="text-gray-400 font-normal">or</span>
                            <span class="h-px w-16 bg-gray-300"></span>
                        </div>

                        <div class="mt-5">
                            <form @submit.prevent="addListUrl">
                                <label for="urlInput"
                                    class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Paste list
                                    URL</label>
                                <div class="relative">
                                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                            class="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                            </path>
                                        </svg>
                                    </div>
                                    <input v-model="state.listUrl" type="search" id="urlInput"
                                        class="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Paste list URL" required>
                                    <button type="submit"
                                        class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add
                                        list</button>
                                </div>
                            </form>
                            <small><b>Note:</b> adding private lists requires Trakt login.</small>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="mt-10">
                            <span class="text-xs font-semibold text-gray-600 py-2">Your lists</span>

                            <draggable v-if="state.lists.length" v-model="state.lists" group="lists" item-key="list.id"
                                @start="state.drag = true" @end="state.drag = false"
                                class="mt-5 w-full text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <template #item="{ element }">
                                    <div
                                        class="grabbable py-2 px-4 w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600 flex">
                                        <span class="mr-2" style="line-height: 32px;">{{ element.name ||
                                                element.slug
                                        }}</span>
                                        <span style="line-height: 32px;"
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-auto mr-2">{{
                                                    element.username
                                            }}</span>
                                        <button type="button"
                                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                            @click="removeList(element)">
                                            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor"
                                                viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clip-rule="evenodd"></path>
                                            </svg>
                                            <span class="sr-only">Remove list</span>
                                        </button>
                                    </div>
                                </template>
                            </draggable>
                            <div v-else class="text-gray-500 mt-5">
                                <p>No lists added</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <!-- <div class="mt-10">
                            <a href="https://ratingposterdb.com/api-key/" target="_blank"
                                class="text-xs font-semibold text-gray-600 py-2">RPDB API (?)</a>
                            <input type="text" id="company"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-5"
                                placeholder="Paste RPDB API Key (optional)">
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div> -->

                        <div class="mt-10 flex flex-col">
                            <button @click="state.install.show(); generateInstallUrl();" type="button"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Install
                                Addon</button>
                        </div>


                        <div class="mt-5 flex flex-col">
                            <p class="text-center text-gray-400">This addon was created by<br />
                                <a href="https://github.com/dexter21767" target="_blank"
                                    class="text-purple-700">dexter21767</a>
                                and
                                <a href="https://github.com/rleroi" target="_blank" class="text-purple-700">rab1t</a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- <SearchModal ref="searchModal" @addList="addList" :searchQuery="state.searchQuery"></SearchModal> -->
    </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import axios from 'axios';
import { reactive, ref, onMounted } from 'vue';
import Modal from 'flowbite/src/components/modal';
import Dropdown from 'flowbite/src/components/dropdown';
import { useHead } from "@vueuse/head";
import $ from 'jquery'
import * as manifest from '../../manifest.json';
// import SearchModal from './components/SearchModal.vue';

const stylizedTypes = manifest.types.map(t => t[0].toUpperCase() + t.slice(1));

useHead({
    title: manifest.name + ' - Stremio Addon',
    link: [
        {
            rel: "icon",
            type: "image/svg+xml",
            href: manifest.logo,
        }
    ],
})

const state = reactive({
    searchResults: [],
    searchQuery: '',
    listUrl: '',
    drag: false,
    checkTrending: true,
    checkPopular: true,
    checkWatchlist: false,
    checkRecommendations: false,
    lists: [],
    modal: null,
    genericLists: null,
    lists_popular: null,
    lists_trending: null,
    install: null,
    popularModal: null,
    trendingModal: null,
    currentUrl: (window.location.origin == "http://localhost:5173") ? 'http://127.0.0.1:63355' : window.location.origin
});
console.log(window.location.origin)
const searchModal = ref();
const generic_Button = ref();
const generic_Menu = ref();
const installModal = ref();
const popularModal = ref();
const trendingModal = ref();;

onMounted(() => {
    getListsOflists()
    generateInstallUrl()
    state.genericLists = new Dropdown(generic_Menu.value, generic_Button.value);
    state.modal = new Modal(searchModal.value);
    state.popularModal = new Modal(popularModal.value);
    state.trendingModal = new Modal(trendingModal.value);
    state.install = new Modal(installModal.value);
});


async function getListsOflists() {
    state.lists_popular = (await axios.get(state.currentUrl + '/lists/popular'))?.data || [];
    state.lists_trending = (await axios.get(state.currentUrl + '/lists/trending'))?.data || [];
}

function generateInstallUrl() {
    let data = {};
    const lists = [];
    let generic = [];
    let query = window.location.search.substring(1);
    if (query) {
        if (query.split('=')[0] == "access_token" && query.split('=')[1] !== "undefined") {
            var access_token = query.split('=')[1];
        }
    } else {
        var access_token = 0;
    }
    if (access_token) {
        document.getElementById('Auth').style.background = 'blue';
        document.getElementById('Auth').innerHTML = 'Autherized';
    }

    if ($('#trakt_trending').is(':checked')) {
        generic.push($('#trakt_trending').val());
    } else {
        generic = generic.filter(function (value, index, arr) {
            return value != $('#trakt_trending').val();
        })
    }
    if ($('#trakt_popular').is(':checked')) {
        generic.push($('#trakt_popular').val());
    } else {
        generic = generic.filter(function (value, index, arr) {
            return value != $('#trakt_popular').val();
        })
    }
    if (access_token) {
        if ($('#trakt_watchlist').is(':checked')) {
            generic.push($('#trakt_watchlist').val());
        } else {
            generic = generic.filter(function (value, index, arr) {
                return value != $('#trakt_watchlist').val();
            })
        }
        if ($('#trakt_rec').is(':checked')) {
            generic.push($('#trakt_rec').val());
        } else {
            generic = generic.filter(function (value, index, arr) {
                return value != $('#trakt_rec').val();
            })
        }
    }
    for (let index in state.lists) {
        let list = state.lists[index];
        console.log("list", list)
        if (list.username) {
            if (list.sort) lists.push(`${list.username}:${list.slug}:${list.sort}`)
            else lists.push(`${list.username}:${list.slug}`)
        } else {
            lists.push(`${list.id}`)
        }
    }
    console.log(lists);
    data['lists'] = generic//.join(',');
    data['ids'] = lists//.join(',');
    if (access_token) {
        data['access_token'] = access_token;
    }
    let configurationValue = JSON.stringify(data);
    //let configurationValue = Object.keys(data).map(key => key + '=' + data[key]).join('|');
    console.log(configurationValue);
    const configuration = configurationValue && configurationValue.length ? '/' + btoa(configurationValue) : '';
    const location = window.location.host + configuration + '/manifest.json'
    document.getElementById("install_button").href = 'stremio://' + location;
}

function addListUrl() {
    let url, username, slug, sort;
    [url, username, slug, sort] = state.listUrl.match(/https:\/\/trakt\.tv\/users\/([^\/?#]+)\/lists\/([^\/#?]+)(\?[^$]+)?/i);

    if (!url || !username || !slug) {
        alert('Invalid Trakt list URL, make sure it starts with https://trakt.tv/');
        return;
    }
    if (sort.split('?')[1]) {
        sort = sort.split('?')[1].split('=')[1];
    }


    state.lists.push({
        name: slug,
        slug: slug,
        username: username,
        sort: sort
    });

}

async function searchLists() {
    state.modal.show();
    state.searchResults = (await axios.get(import.meta.env.VITE_APP_URL + '/lists/' + state.searchQuery))?.data || [];
}

function addList(list) {
    state.lists.push({
        name: list.name,
        slug: list.slug,
        username: list.user,
        sort: list.sort,
        id: list.id
    });
}

function removeList(list) {
    const index = state.lists.indexOf(list);
    if (index === -1) {
        return;
    }

    state.lists.splice(index, 1);
}
function readmore(id) {
    document.getElementById(`${id}_more`).classList.remove('hidden');
    document.getElementById(`${id}_less`).classList.add('hidden');
}

function readless(id) {
    document.getElementById(`${id}_less`).classList.remove('hidden');
    document.getElementById(`${id}_more`).classList.add('hidden');
}
</script>


<style scoped>
h1 {
    font-size: x-large;
    text-align: center;
    color: red;
    padding-top: 10px;
}

.logo {
    margin: auto;
    max-width: 200px;
}

.grabbable {
    cursor: move;
    /* fallback if grab cursor is unsupported */
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
}

/* (Optional) Apply a "closed-hand" cursor during drag operation. */
.grabbable:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
}

.bg-img {
    background: fixed;
    background-size: cover;
    background-position: center center;
    background-repeat: repeat-y;
}


/* Header fixed to the top of the modal */
.modal-header {
    position: sticky;
    top: 0;
    background-color: inherit;
    /* [1] */
    z-index: 1055;
    /* [2] */
}
</style>