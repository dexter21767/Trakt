<template>
    <div>


        <!-- Search modal -->
        <div id="searchModal" ref="searchModal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
            <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto h-full">
                    <!-- Modal header -->
                    <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                        <h3 class="w-full text-xl font-semibold text-gray-900 dark:text-white mr-4">

                            <form @submit.prevent="getLists" class="w-full">
                                <label for="searchModalInput"
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
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">


                        <div class="flex flex-col w-full gap-3 z-10">
                            <div v-for="item in state.searchResults" :key="item.id"
                                class="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {{item.name}} <small>by {{item.user}}</small> 
                                        <span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">{{item.likes}} likes</span>
                                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">Items count: {{item.item_count}}</span></h5>
                                </a>
                                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{{item.description}}</p>
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


        <div class="bg-img relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gray-500 bg-no-repeat bg-cover bg-center relative items-center"  :style="`background-image: url(${manifest.background});`">
            <div class="absolute bg-black opacity-60 inset-0 z-0"></div>
            <div class="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl z-10">


                <div class="grid gap-8 grid-cols-1">
                    <div class="flex flex-col ">
                        <div class="items-center header">
                            <img class="logo" :src="manifest.logo">
                            <h1 class="font-semibold text-lg mr-auto">{{ manifest.name }}</h1>
                            <h2 class="font-semibold text-lg mr-auto" style="text-align: right;">Version: {{ manifest.version }}</h2>
                            <p class="mt-5" >{{ manifest.description }}</p>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="items-center mt-5 description">
                            <h2 class="font-semibold text-lg mr-auto">This addon has more :</h2>
                            <ul v-html="stylizedTypes.map(t => `<li>${t}</li>`).join('')"></ul>
                        </div>
                        <div class="mt-10">
                            <span class="text-xs font-semibold text-gray-600 py-2">Add personal lists (requires Trakt
                                login)</span>
                            <div class="mt-5 flex flex-col items-center">
                                <a href="https://trakt.tv/oauth/authorize?client_id=18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281&redirect_uri=https%3A%2F%2F2ecbbd610840-trakt.baby-beamup.club%2F&response_type=code">
                                <button type="button"
                                    class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Login
                                    to Trakt.tv</button></a>
                            </div>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkRecommendations">
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Your
                                        Recommendations</span>
                                </label>
                            </div>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkWatchlist">
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Your
                                        Watchlist</span>
                                </label>
                            </div>
                        </div>


                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="mt-10">
                            <span class="text-xs font-semibold text-gray-600 py-2">Add special lists</span>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkTrending">
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Trakt
                                        Trending</span>
                                </label>
                            </div>
                            <div class="mt-5">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" v-model="checkPopular">
                                    <div
                                        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                    </div>
                                    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Trakt
                                        Popular</span>
                                </label>
                            </div>
                        </div>


                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        
                        <div class="flex mt-5 flex-col sm:flex-row items-center">
                            <h2 class="font-semibold text-lg mr-auto">Popular Lists</h2>
                            <div class="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
                        </div>



                        <button id="dropdownButton" ref="Button_popular"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            type="button">Dropdown button <svg aria-hidden="true" class="ml-2 w-4 h-4" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7"></path>
                            </svg></button>

                        <div id="dropdownMenu" ref="Menu_popular"
                            class="dropdown hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
                            <div v-for="item in state.lists_popular" :key="item.id"
                                class="p-4 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {{item.name}} <small>by {{item.user}}</small><span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">{{item.likes}} likes</span>
                                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">Items count: {{item.item_count}}</span></h5>
                                </a>
                                <p class="mb-3 text-xs text-gray-700 dark:text-gray-400">{{item.description}}</p>
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


                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-16 bg-gray-300"></span>
                            <span class="text-gray-400 font-normal">or</span>
                            <span class="h-px w-16 bg-gray-300"></span>
                        </div>


                        <div class="flex flex-col sm:flex-row items-center">
                            <h2 class="font-semibold text-lg mr-auto">Trending Lists</h2>
                            <div class="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
                        </div>

                        <button id="dropdownButton" ref="Button_trending"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            type="button">Dropdown button <svg aria-hidden="true" class="ml-2 w-4 h-4" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7"></path>
                            </svg></button>
                        <!-- Dropdown menu -->
                        <div id="dropdownMenu" ref="Menu_trending"
                            class="dropdown hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
                            <div v-for="item in state.lists_trending" :key="item.id"
                                class="p-4 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {{item.name}} <small>by {{item.user}}</small><span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">{{item.likes}} likes</span>
                                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">Items count: {{item.item_count}}</span></h5>
                                </a>
                                <p class="mb-3 text-xs text-gray-700 dark:text-gray-400">{{item.description}}</p>
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


                        <div class="flex items-center justify-center space-x-2 mt-10">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>


                        <div class="flex flex-col mt-5 sm:flex-row items-center">
                            <h2 class="font-semibold text-lg mr-auto">Trakt Lists</h2>
                            <div class="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
                        </div>


                        <div class="mt-5">
                            <form @submit.prevent="getLists">
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
                            <small><b>Note:</b> adding private lists require trakt login.</small>
                        </div>

                        <div class="flex items-center justify-center space-x-2 mt-5">
                            <span class="h-px w-full bg-gray-200"></span>
                        </div>

                        <div class="mt-10">
                            <span class="text-xs font-semibold text-gray-600 py-2">Your lists</span>

                            <draggable v-if="state.lists.length" v-model="state.lists" group="lists"
                                item-key="list.slug" @start="state.drag=true" @end="state.drag=false"
                                class="mt-5 w-full text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <template #item="{element}">
                                    <div
                                        class="grabbable py-2 px-4 w-full rounded-t-lg border-b border-gray-200 dark:border-gray-600 flex">
                                        <span class="mr-2" style="line-height: 32px;">{{element.name ||
                                        element.slug}}</span>
                                        <span style="line-height: 32px;"
                                            class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-auto mr-2">{{element.username}}</span>
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
                            <button type="button"
                                class="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 mr-2">Donate</button>
                            <button type="button"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Install
                                Addon</button>
                        </div>

                        <div class="mt-5 flex flex-col">
                            <p style="text-align: center;">This addon was made by <a class="github"
                                    href="https://github.com/dexter21767">dexter21767</a> and <a class="github"
                                    href="https://github.com/rleroi">Rab1t</a>.</p>
                        </div>
                        <!-- <div class="mt-5">
                            <div class="form">
                                <div class="md:space-y-2 mb-3">
                                    <label class="text-xs font-semibold text-gray-600 py-2">Company Logo<abbr
                                            class="hidden" title="required">*</abbr></label>
                                    <div class="flex items-center py-6">
                                        <div class="w-12 h-12 mr-4 flex-none rounded-xl border overflow-hidden">
                                            <img class="w-12 h-12 mr-4 object-cover"
                                                src="https://images.unsplash.com/photo-1611867967135-0faab97d1530?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=1352&amp;q=80"
                                                alt="Avatar Upload">
                                        </div>
                                        <label class="cursor-pointer ">
                                            <span
                                                class="focus:outline-none text-white text-sm py-2 px-4 rounded-full bg-green-400 hover:bg-green-500 hover:shadow-lg">Browse</span>
                                            <input type="file" class="hidden" :multiple="multiple" :accept="accept">
                                        </label>
                                    </div>
                                </div>
                                <div class="md:flex flex-row md:space-x-4 w-full text-xs">
                                    <div class="mb-3 space-y-2 w-full text-xs">
                                        <label class="font-semibold text-gray-600 py-2">Company Name <abbr
                                                title="required">*</abbr></label>
                                        <input placeholder="Company Name"
                                            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            required="required" type="text" name="integration[shop_name]"
                                            id="integration_shop_name">
                                        <p class="text-red text-xs hidden">Please fill out this field.</p>
                                    </div>
                                    <div class="mb-3 space-y-2 w-full text-xs">
                                        <label class="font-semibold text-gray-600 py-2">Company Mail <abbr
                                                title="required">*</abbr></label>
                                        <input placeholder="Email ID"
                                            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            required="required" type="text" name="integration[shop_name]"
                                            id="integration_shop_name">
                                        <p class="text-red text-xs hidden">Please fill out this field.</p>
                                    </div>
                                </div>
                                <div class="mb-3 space-y-2 w-full text-xs">
                                    <label class=" font-semibold text-gray-600 py-2">Company Website</label>
                                    <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                                        <div class="flex">
                                            <span
                                                class="flex items-center leading-normal bg-grey-lighter border-1 rounded-r-none border border-r-0 border-blue-300 px-3 whitespace-no-wrap text-grey-dark text-sm w-12 h-10 bg-blue-300 justify-center items-center  text-xl rounded-lg text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                                    </path>
                                                </svg>
                                            </span>
                                        </div>
                                        <input type="text"
                                            class="flex-shrink flex-grow flex-auto leading-normal w-px flex-1 border border-l-0 h-10 border-grey-light rounded-lg rounded-l-none px-3 relative focus:border-blue focus:shadow"
                                            placeholder="https://">
                                    </div>
                                </div>
                                <div class="md:flex md:flex-row md:space-x-4 w-full text-xs">
                                    <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">Company Address</label>
                                        <input placeholder="Address"
                                            class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                            type="text" name="integration[street_address]"
                                            id="integration_street_address">
                                    </div>
                                    <div class="w-full flex flex-col mb-3">
                                        <label class="font-semibold text-gray-600 py-2">Location<abbr
                                                title="required">*</abbr></label>
                                        <select
                                            class="block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4 md:w-full "
                                            required="required" name="integration[city_id]" id="integration_city_id">
                                            <option value="">Seleted location</option>
                                            <option value="">Cochin,KL</option>
                                            <option value="">Mumbai,MH</option>
                                            <option value="">Bangalore,KA</option>
                                        </select>
                                        <p class="text-sm text-red-500 hidden mt-3" id="error">Please fill out this
                                            field.</p>
                                    </div>
                                </div>
                                <div class="flex-auto w-full mb-1 text-xs space-y-2">
                                    <label class="font-semibold text-gray-600 py-2">Description</label>
                                    <textarea required="" name="message" id=""
                                        class="w-full min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4"
                                        placeholder="Enter your comapny info" spellcheck="false"></textarea>
                                    <p class="text-xs text-gray-400 text-left my-3">You inserted 0 characters</p>
                                </div>
                                <p class="text-xs text-red-500 text-right my-3">Required fields are marked with an
                                    asterisk <abbr title="Required field">*</abbr></p>
                                <div class="mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">
                                    <button
                                        class="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100">
                                        Cancel </button>
                                    <button
                                        class="mb-2 md:mb-0 bg-green-400 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-green-500">Save</button>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import axios from 'axios';
import { reactive, ref, onMounted } from 'vue';
import Modal from 'flowbite/src/components/modal';
import Dropdown from 'flowbite/src/components/dropdown';
import * as manifest from '../../manifest.json';
import { useHead } from "@vueuse/head";

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
    dropdownPopular: null,
    dropdownTrending: null,
    lists_popular: null,
    lists_trending: null,
});

const searchModal = ref();
const Button_popular = ref();
const Menu_popular = ref();
const Button_trending = ref();
const Menu_trending = ref();

onMounted(() => {
    getListsOflists()
    state.dropdownPopular = new Dropdown(Menu_popular.value, Button_popular.value);
    state.dropdownTrending = new Dropdown(Menu_trending.value, Button_trending.value);
    state.modal = new Modal(searchModal.value);
});


async function getListsOflists() {
    var list = (await axios.get(import.meta.env.VITE_APP_URL + '/lists/popular'))?.data || [];
    state.lists_popular = list;

    var list = (await axios.get(import.meta.env.VITE_APP_URL + '/lists/trending'))?.data || [];
    state.lists_trending = list;
}



function addListUrl() {
    let url, username, slug, sort;
    [url, username, slug] = state.listUrl.match(/https:\/\/trakt\.tv\/users\/([^\/?#]+)\/lists\/([^\/#]+)/i);
    
    console.log(username, slug)
    if(slug.split('?')[1]){
        sort = slug.split('?')[1].split('=')[1].split(',');
    }
    slug = slug.split('?')[0];
    console.log(username, slug, sort)
    if (!url || !username || !slug) {
        alert('Invalid Trakt list URL, make sure it starts with https://trakt.tv/');
        return;
    }

    state.lists.push({
        username,
        slug,
        sort,
    });
}


async function getLists() {
    state.modal.show();
    state.searchResults = (await axios.get(import.meta.env.VITE_APP_URL + '/lists/' + state.searchQuery))?.data || [];
}

function addList(list) {
    state.lists.push({
        name: list.name,
        slug: list.id,
        username: list.user,
    });
}

function removeList(list) {
    const index = state.lists.indexOf(list);
    if (index === -1) {
        return;
    }

    state.lists.splice(index, 1);
}
</script>


<style scoped>
a.github:link {
    color: red;
    font-weight: bold;
}

a.github:visited {
  color: rgb(108 43 217 / var(--tw-bg-opacity));
}

a.github:hover {
  color: rgb(26 86 219 / var(--tw-bg-opacity));
}

.dropdown {

    width: fit-content;
    max-width: inherit;


}

h1 {
    font-size: x-large;
    text-align: center;
    color: red;
    padding-top: 10px;
}

.separator {
    margin-bottom: 4vh;
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

.bg-img{
    background: fixed;
    background-size: cover;
    background-position: center center;
    background-repeat: repeat-y;
}
</style>