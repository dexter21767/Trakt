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
                                <form @submit.prevent="searchLists" class="w-full">
                                    <label for="searchModalInput"
                                        class="relative mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search
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
                            </h3>
                            <!-- Close Modal button -->
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
                                <p :id="`${item.id}_more`" class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
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

        <!-- personal Lists modal -->
        <div id="personalModal" ref="personalModal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
            <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto h-full">
                    <!-- Modal header -->
                    <div class="modal-header">

                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                            <h3 class="w-full text-xl font-semibold text-gray-900 dark:text-white mr-4">Trakt personal
                                Lists
                            </h3>
                            <button @click="state.personalModal.toggle" type="button"
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
                            <div v-for="item in state.lists_personal" :key="item.id"
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
                                    {{ item.description?.slice(0, 100) }} <button class="readmore"
                                        @click="readmore(item.id)">read more</button></p>
                                <p :id="`${item.id}_more`" class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
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
                                <p :id="`${item.id}_more`" class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
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
                            <h3 class="w-full text-xl font-semibold text-gray-900 dark:text-white mr-4">Trakt trending
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
                                <p :id="`${item.id}_more`" class="hidden mb-3 font-normal text-gray-700 dark:text-gray-400">
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
                        <div>
                            <b class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                From the river to the sea, Palestine will be free. 
                            </b>
                                <!--
                                Hello guys, if you enjoy this addon and want to keep working, and want new features to be
                                added <br>Then please consider donating.</p>
                            <div style="align-items: center; display: flex; justify-content: center;">
                                <div style="margin: auto">
                                    <p>Buymeacoffee.com</p>
                                    <a href="https://www.buymeacoffee.com/dexter21767"><img
                                            src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=dexter21767&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>
                                </div>
                                <div style="margin: auto">
                                    <p>Ko-fi.com</p>
                                    <a href='https://ko-fi.com/G2G0H5KL5' target='_blank'><img height='36'
                                            style="border:0px;height:36px;"
                                            src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0'
                                            alt='Buy Me a Coffee at ko-fi.com' /></a>
                                </div>
                            </div>-->
                        </div>
                        <div>
                            <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                huge thanks to Rab1t for histremendous help.</p>
                        </div>
                    </div>
                    <!-- Modal footer -->
                    <div class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                        <a id="install_button" href="#"><button type="button"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Install
                                Addon</button></a>
                        <button type="button" @click="state.install.hide();"
                            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
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
                                    :href="`https://trakt.tv/oauth/authorize?client_id=18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281&redirect_uri=${encodeURIComponent(Consts.currentUrl)}&response_type=code`">
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
                                    type="button">Generic Lists: <svg aria-hidden="true" class="ml-2 w-4 h-4" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7"></path>
                                    </svg></button>
                            </div>
                            <!-- Dropdown menu -->
                            <div id="generic_Menu" ref="generic_Menu"
                                class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
                                <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="generic_Button"
                                    style="width: max-content;">
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

                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>


                        <span class="text-xs font-semibold text-gray-600 py-2 mt-10">Add lists</span>

                        <div class="flex rounded-md shadow-sm mt-5 w-full" role="group" style="flex-direction: column;">
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

                            <button @click="state.personalModal.show()" type="button"
                                class="grow py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                                Browse personal lists (requires login)
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
                                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

                        <div class="mt-5">
                            <small><b>RPDB key:</b> <a href="https://ratingposterdb.com/api-key/" target="_blank"
                                    class="text-xs font-semibold text-gray-600 py-2">RPDB API (?)</a></small>


                            <form @submit.prevent="ValidateRPDB">

                                <div class="relative flex">
                                    <input v-model="state.RPDBkey.key" id="RPDB"
                                        class="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Paste RPDB API Key (optional)" required>
                                    <button type="submit"
                                        class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Validate
                                        key</button>
                                </div>
                                <small v-if="state.RPDBkey.valid !== null">key is: <b v-if="state.RPDBkey.valid"
                                        style="color: green;">Valid</b><b v-if="!state.RPDBkey.valid"
                                        style="color: red;">Invalid</b></small>


                                <div class="relative" v-if="state.RPDBkey.valid">
                                    <small>Poster type:</small>
                                    <dropdown class="sorting-dropdown" :options="state.RPDBkey.posters"
                                        :selected="{ name: state.RPDBkey.poster }" v-on:updateOption="RPDBposter"
                                        :placeholder="'Select poster type'" :closeOnOutsideClick="true">
                                    </dropdown>
                                </div>
                            </form>

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
                                        <div class="flex">
                                            <span class="mr-2 dragable-title">
                                                {{ element.name || element.slug }}
                                            </span>
                                            <span style="line-height: 32px;"
                                                class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 mr-2">
                                                {{ element.username }}
                                            </span>
                                            <button type="button"
                                                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                                @click="removeList(element)">
                                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor"
                                                    viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clip-rule="evenodd">
                                                    </path>
                                                </svg>
                                                <span class="sr-only">Remove list</span>
                                            </button>
                                        </div>
                                        <dropdown class="sorting-dropdown" :options="Consts.SortOptions"
                                            :selected="{ name: getSorting(element.sort), value: element.sort }"
                                            v-on:updateOption="updateSorting($event, element)"
                                            :placeholder="'Select default sorting'" :closeOnOutsideClick="true">
                                        </dropdown>
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
                                .<!--<br> Background by:
                                <a href="https://twitter.com/art_pengu" target="_blank" class="text-purple-700">Bahadır
                                    Parıldar</a>-->
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
import { Buffer } from 'buffer';
import draggable from 'vuedraggable';
import axios from 'axios';
import { reactive, ref, onMounted } from 'vue';
import Modal from 'flowbite/src/components/modal';
import Dropdown from 'flowbite/src/components/dropdown';
import { useHead } from "@vueuse/head";
import $ from 'jquery'
import * as manifest from '../../manifest.json';
import dropdown from 'vue-dropdowns';

// import SearchModal from './components/SearchModal.vue';

const stylizedTypes = manifest.types.map(t => t[0].toUpperCase() + t.slice(1));

const Consts = {};

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
    lists_personal: null,
    install: null,
    popularModal: null,
    trendingModal: null,
    personalModal: null,
    accessToken: null,
    refreshToken: null,
    expires: null,
    expired: false,
    RPDBkey: { key: null, valid: null, poster: 'poster-default', posters: null, tier: null },
});

const searchModal = ref();
const generic_Button = ref();
const generic_Menu = ref();
const installModal = ref();
const popularModal = ref();
const trendingModal = ref();
const personalModal = ref();

Consts.SortOptions = [{ name: "Added Ascendent", value: "added,asc" }, { name: "Added Descendent", value: "added,desc" }, { name: "Title Ascendent", value: "title,asc" }, { name: "Title Descendent", value: "title,desc" }, { name: "Released Ascendent", value: "released,asc" }, { name: "Released Descendent", value: "released,desc" }, { name: "Runtime Ascendent", value: "runtime,asc" }, { name: "Runtime Descendent", value: "runtime,desc" }, { name: "Votes Ascendent", value: "votes,asc" }, { name: "Votes Descendent", value: "votes,desc" }, { name: "Rating Ascendent", value: "rating,asc" }, { name: "Rating Descendent", value: "rating,desc" }, { name: "Rank Ascendent", value: "rank,asc" }, { name: "Rank Descendent", value: "rank,desc" }];

Consts.currentUrl = (window.location.origin == "http://localhost:5173") ? 'http://127.0.0.1:63355' : window.location.origin;

const client = axios.create({
    baseURL: Consts.currentUrl,
    timeout: 10000,
});

onMounted(() => {
    Consts.Config = (window.location.pathname && window.location.pathname.split('/')) ? Consts.Config = window.location.pathname.replace('configure', '').replaceAll('/', '') : undefined;
    console.log(Consts.Config)
    loadConfig();
    getListsOflists()
    generateInstallUrl()

    state.genericLists = new Dropdown(generic_Menu.value, generic_Button.value);
    state.modal = new Modal(searchModal.value);
    state.popularModal = new Modal(popularModal.value);
    state.trendingModal = new Modal(trendingModal.value);
    state.personalModal = new Modal(personalModal.value);
    state.install = new Modal(installModal.value);
});

function loadConfig() {
    let configuration = Consts.Config;
    if (!configuration) return;

    if (!configuration.startsWith('lists')) configuration = Buffer.from(configuration, 'base64').toString();

    let { lists, ids, access_token, refresh_token, expires } = JSON.parse(configuration);

    console.log("lists", lists, "ids", ids, "access_token", access_token, "refresh_token", refresh_token, "expires", expires);

    if (access_token) state.accessToken = access_token;
    if (refresh_token) state.refreshToken = refresh_token;
    if (expires) state.expires = expires;

    for (let i = 0; i < ids.length; i++) {

        let id = ids[i];
        let [username, slug, sort] = id.split(':');
        state.lists.push({
            name: slug,
            slug: slug,
            username: username,
            sort: sort
        });
        //console.log("state.lists", state.lists)
    }

    if (lists && lists.length) {

        state.checkTrending = lists.includes('trakt_trending') ? true : false;
        $("#trakt_trending").prop("checked", state.checkTrending);

        state.checkPopular = lists.includes('trakt_popular') ? true : false;
        $("#trakt_popular").prop("checked", state.checkPopular);

        state.checkWatchlist = lists.includes('trakt_watchlist') ? true : false;
        $("#trakt_watchlist").prop("checked", state.checkWatchlist);

        state.checkRecommendations = lists.includes('trakt_rec') ? true : false;
        $("#trakt_rec").prop("checked", state.checkRecommendations);
    }



}

function getSorting(sort) {
    for (let option in Consts.SortOptions) {
        if (Consts.SortOptions[option].value == sort) return Consts.SortOptions[option].name;
    }
    return;
}

function updateSorting(sort, list) {
    console.log("sort", sort, "list", list)
    const index = state.lists.indexOf(list);
    state.lists[index].sort = sort.value
}

async function getListsOflists() {
    try {
        state.lists_popular = (await client.get('/lists/popular'))?.data || [];
        state.lists_trending = (await client.get('/lists/trending'))?.data || [];
        if (state.accessToken) {
            let lists_personal = await client.get('/lists/personal?token=' + state.accessToken).catch(e => { console.error(e) });
            state.lists_personal = lists_personal?.data || [];
        }
        console.log("state.lists_personal", state.lists_personal)
    } catch (e) {
        console.error(e);
    }
}

function setButton(expression) {
    if(!expression) expression = 'auth';
    if(expression === 'authed'){
        document.getElementById('Auth').style.background = 'blue';
        document.getElementById('Auth').innerHTML = 'Authenticated';
        document.getElementById('Auth').parentNode.href = '';
        document.getElementById('Auth').disabled = true;
    }else if(expression === 'reauth'){
        document.getElementById('Auth').style.background = 'red';
        document.getElementById('Auth').innerHTML = 'Re-authenticate';
        document.getElementById('Auth').parentNode.href = Consts.Config ? `${Consts.currentUrl}/${Consts.Config}/?refresh_token=${state.refreshToken}`:`${Consts.currentUrl}/?refresh_token=${state.refreshToken}`;
        document.getElementById('Auth').disabled = false;
    }else if(expression === 'auth'){
        document.getElementById('Auth').style.background = 'red';
        document.getElementById('Auth').innerHTML = 'Login to Trakt.tv';
        document.getElementById('Auth').parentNode.href = `https://trakt.tv/oauth/authorize?client_id=18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281&redirect_uri=${encodeURIComponent(Consts.currentUrl)}&response_type=code`;
        document.getElementById('Auth').disabled = false;
    }
}

function generateInstallUrl() {
    let data = {};
    const lists = [];
    let generic = [];
    //let query = window.location.search.substring(1);
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('access_token')) {
        state.accessToken = searchParams.get('access_token');
    }

    if (searchParams.has('refresh_token'))
        state.refreshToken = searchParams.get('refresh_token');

    if (searchParams.has('expires')) {
        state.expires = parseInt(searchParams.get('expires'));
        const currentTime = new Date().getTime() / 1000;
        state.expired = currentTime > state.expires;
        if (state.expired) state.accessToken = null;
    }

    if (state.accessToken && state.expires && !state.expired) {
        setButton('authed');
    } else if (state.expired && state.refreshToken) {
        setButton('reauth');
    } else {
        setButton('auth');
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
    if (state.accessToken) {
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
        //console.log("list", list)
        if (list.username) {
            if (list.sort) lists.push(`${list.username}:${list.slug}:${list.sort}`)
            else lists.push(`${list.username}:${list.slug}`)
        } else {
            lists.push(`${list.id}`)
        }
    }
    //console.log(lists);
    data['lists'] = generic//.join(',');
    data['ids'] = lists//.join(',');
    if (state.accessToken) data['access_token'] = state.accessToken;
    if (state.refreshToken) data['refresh_token'] = state.refreshToken;
    if (state.expires) data['expires'] = state.expires;
    if (state.RPDBkey.valid) data['RPDBkey'] = state.RPDBkey;


    let configurationValue = JSON.stringify(data);
    //let configurationValue = Object.keys(data).map(key => key + '=' + data[key]).join('|');
    //console.log(configurationValue);
    const configuration = configurationValue && configurationValue.length ? '/' + Buffer.from(configurationValue).toString('base64') : '';
    const location = window.location.host + configuration + '/manifest.json'
    document.getElementById("install_button").href = 'stremio://' + location;

    //console.log('state', state);
}

function addListUrl() {
    let url, username, slug, sort;
    [url, username, slug, sort] = state.listUrl.match(/https:\/\/trakt\.tv\/users\/([^\/?#]+)\/lists\/([^\/#?]+)(\?[^$]+)?/i);

    if (!url || !username || !slug) {
        alert('Invalid Trakt list URL, make sure it starts with https://trakt.tv/');
        return;
    }
    if (sort?.split('?')[1]) {
        sort = sort.split('?')[1].split('=')[1];
    }


    state.lists.push({
        name: slug,
        slug: slug,
        username: username,
        sort: sort || 'title,asc'
    });

}

async function searchLists() {
    state.modal.show();
    state.searchResults = (await axios.get(Consts.currentUrl + '/lists/' + state.searchQuery))?.data || [];
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

async function ValidateRPDB() {
    state.RPDBkey.valid = null;
    //console.log(state.RPDBkey)
    try {
        let validate = await client.get(`https://api.ratingposterdb.com/${state.RPDBkey.key}/isValid`)
        if (validate?.data?.valid) state.RPDBkey.valid = validate.data.valid;
        else state.RPDBkey.valid = false;
    } catch (e) {
        state.RPDBkey.valid = false;
    }
    if (state.RPDBkey.valid) state.RPDBkey.tier = parseInt(state.RPDBkey.key[1]);
    //console.log(state.RPDBkey)

    if (state.RPDBkey.tier > 1) state.RPDBkey.posters = [{ name: "poster-default" }, { name: "textless-default" }, { name: "poster-certs" }, { name: "poster-mc" }, { name: "poster-rt" }];
    else state.RPDBkey.posters = [{ name: "poster-default" }, { name: "textless-default" }];
}
function RPDBposter(val) {
    state.RPDBkey.poster = val.name;
    //console.log('RPDBkey',state.RPDBkey)
    //console.log('val',val)
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

    display: flex;
    flex-direction: column;
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

#RPDB {
    width: -webkit-fill-available
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

.dragable-title {
    margin-top: auto;
    margin-bottom: auto;
    font-size: medium;
    flex: 1;
    padding-left: 5%;
}

.sorting-dropdown {
  border-radius: 5px;
 
  :deep(.dropdown-toggle) {
    color: rgb(26 86 219 / var(--tw-bg-opacity));
    font-weight: bold;
    /*font-size: 25px;*/
  }
 
  :deep(.dropdown-toggle-placeholder) {
    color: #c4c4c4;
  }
}
</style>