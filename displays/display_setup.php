<?php
// display_setup.php

// Check if the 'access_granted' cookie isn't set or is incorrect
if (!isset($_COOKIE['access_granted']) || $_COOKIE['access_granted'] !== '1') {
    // Figure out where we’re trying to go (this page), so we can redirect back
    $currentPage = basename(__FILE__);
    // OR if the file can appear in subfolders, do something like:
    // $currentPage = $_SERVER['REQUEST_URI'];

    // Send them to login.php with a redirect parameter
    header('Location: login.php?redirect=' . urlencode($currentPage));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['jsonData'])) {
        $jsonData = $_POST['jsonData'];
        if (json_decode($jsonData) === null) {
            echo "Invalid JSON data. Please check your input.";
            exit;
        }
        $file = 'json/calendar.json';
        if (file_put_contents($file, $jsonData)) {
            echo "Calendar updated successfully!";
        } else {
            echo "Failed to update calendar.";
        }
        exit;
    }
}

$jsonContent = file_get_contents('json/calendar.json');
$calendarData = json_decode($jsonContent, true);
if ($calendarData === null) {
    $calendarData = []; 
}

// Load video categories from videos.json
$videoJsonContent = file_get_contents('json/videos.json');
$videosData = json_decode($videoJsonContent, true);
$videoCategories = isset($videosData['categories']) ? $videosData['categories'] : [];

// Load slideshow options from slideshows.json
$slideshowJsonContent = file_get_contents('json/slideshows.json');
$slideshowsData = json_decode($slideshowJsonContent, true);
$availableSlideshows = [];
if ($slideshowsData && isset($slideshowsData['slideshows'])) {
    foreach ($slideshowsData['slideshows'] as $slide) {
        // Assuming each slideshow has a title field.
        $availableSlideshows[] = $slide['title'];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Display Setup</title>
    <!-- Load Vue.js from CDN -->
    <script src="https://unpkg.com/vue@3"></script>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1, h2 { color: #333; }
        .global-default { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
        .period { margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; }
        .period input, .period select { margin: 5px; }
        .insert-period { text-align: center; margin-bottom: 10px; }
        .insert-period button { font-size: 1.5em; padding: 5px 10px; }
        button { margin: 5px; }
        label { display: inline-block; width: 150px; }
        .error { border: 2px solid red !important; }
        .date-entry { margin-bottom: 5px; }
        .remove-schedule { margin-top: 10px; }
        nav {
            background: #eee;
            padding: 10px;
            text-align: center;
        }
        nav a {
            margin: 0 15px;
            text-decoration: none;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <nav style="background: #eee; padding: 10px; text-align: center; margin-bottom: 20px;">
      <a href="display_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Display Setup</a>
      <a href="video_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Video Setup</a>
      <a href="slideshow_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Slideshow Setup</a>
      <a href="image_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Image Setup</a>
    </nav>
    <h1>Display Setup</h1>
    <!-- Global Default Display Option -->
    <div class="global-default">
        <label for="globalDefault">Global Default Display:</label>
        <select id="globalDefault" v-model="globalDefaultDisplay">
            <option value="clock">Clock</option>
            <option value="youtube">YouTube</option>
            <option value="google_slides">Google Slides</option>
			<option value="dashboard">Dashboard</option>
        </select>
    </div>
    <div id="app">
        <div>
            <label for="scheduleSelect">Select Schedule:</label>
            <select v-model="selectedScheduleKey" id="scheduleSelect">
                <option v-for="(schedule, key) in schedules" :value="key">{{ key }}</option>
                <option value="__new">New Schedule</option>
            </select>
            <!-- Remove Schedule button appears only for existing schedules -->
            <button v-if="selectedScheduleKey !== '__new'" @click="removeSchedule" class="remove-schedule">Remove Schedule</button>
        </div>
        <div v-if="selectedScheduleKey === '__new'" style="margin-top: 10px;">
            <label for="newScheduleName">New Schedule Name:</label>
            <input type="text" id="newScheduleName" v-model="newScheduleName">
        </div>
        <!-- New Calendar: Associated Dates -->
        <div v-if="selectedScheduleKey === '__new'">
            <h2>Associated Dates</h2>
            <div v-if="newScheduleDates.length === 0">
                <p>No dates added yet. Click "Add Date" to add one.</p>
            </div>
            <div v-for="(date, index) in newScheduleDates" :key="index" class="date-entry">
                <input type="date" v-model="newScheduleDates[index]">
                <button @click="removeDate(index)">Remove</button>
            </div>
            <button @click="addDate">Add Date</button>
        </div>
        <h2>Periods</h2>
        <!-- Plus button before first period if there is at least one period -->
        <div v-if="currentSchedule.length > 0" class="insert-period">
            <button @click="insertPeriodBefore()">＋ Insert Period Before</button>
        </div>
        <div v-if="currentSchedule.length === 0">
            <p>No periods defined. Click "Add Period" to get started.</p>
        </div>
        <div v-for="(period, index) in currentSchedule" :key="index">
            <div class="period">
                <div>
                    <label>Period Name:</label>
                    <input type="text" v-model="period.name">
                </div>
                <div>
                    <label>Start Time (24h):</label>
                    <input type="time" v-model="period.start" step="60" placeholder="HH:mm"
                           :class="{'error': overlapErrors[index] && overlapErrors[index].start}">
                </div>
                <div>
                    <label>End Time (24h):</label>
                    <input type="time" v-model="period.end" step="60" placeholder="HH:mm"
                           :class="{'error': overlapErrors[index] && overlapErrors[index].end}">
                </div>
                <div>
                    <label>Description:</label>
                    <input type="text" v-model="period.description">
                </div>
                <!-- Display During Period Section -->
                <div>
                    <label>Display During Period:</label>
                    <select v-model="period.displayDuring" @change="onDisplayDuringChange(period)">
                        <option value="youtube">YouTube</option>
                        <option value="google_slides">Google Slides</option>
                        <option value="image">Image</option>
                        <option value="clock">Clock</option>
                        <option value="countdown">Countdown Clock</option>
						<option value="dashboard">Dashboard</option>
                    </select>
                </div>
                <!-- Extra field for Display During: YouTube or Google Slides -->
                <div v-if="period.displayDuring === 'youtube'">
                    <label>Video Category:</label>
                    <select v-model="period.videoCategory">
                        <option value="">Select a category</option>
                        <option v-for="cat in videoCategories" :value="cat">{{ cat }}</option>
                    </select>
                </div>
                <div v-if="period.displayDuring === 'google_slides'">
                    <label>Slideshow:</label>
                    <select v-model="period.slideshow">
                        <option value="">Select a slideshow</option>
                        <option v-for="slide in slideshowOptions" :value="slide">{{ slide }}</option>
                    </select>
                </div>
                <!-- Display Between Periods Section -->
                <div v-if="index < currentSchedule.length - 1">
                    <label>Display Between Periods:</label>
                    <select v-model="period.displayBetween" @change="onDisplayBetweenChange(period)">
                        <option value="countdown">Countdown</option>
                        <option value="youtube">YouTube</option>
                        <option value="google_slides">Google Slides</option>
                        <option value="image">Image</option>
                        <option value="clock">Clock</option>
						<option value="dashboard">Dashboard</option>

                    </select>
                    <!-- Extra field for Between: YouTube -->
                    <div v-if="period.displayBetween === 'youtube'">
                        <label>Between Video Category:</label>
                        <select v-model="period.betweenVideoCategory">
                            <option value="">Select a category</option>
                            <option v-for="cat in videoCategories" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <!-- Extra field for Between: Google Slides -->
                    <div v-if="period.displayBetween === 'google_slides'">
                        <label>Between Slideshow:</label>
                        <select v-model="period.betweenSlideshow">
                            <option value="">Select a slideshow</option>
                            <option v-for="slide in slideshowOptions" :value="slide">{{ slide }}</option>
                        </select>
                    </div>
                </div>
                <button @click="removePeriod(index)">Remove</button>
            </div>
            <!-- Insert plus button between periods -->
            <div v-if="index < currentSchedule.length - 1" class="insert-period">
                <button @click="insertPeriod(index)">＋ Insert Period</button>
            </div>
        </div>
        <button @click="addPeriod">Add Period to End</button>
        <br><br>
        <button @click="saveCalendar">Save Calendar</button>
        <p v-if="message">{{ message }}</p>
    </div>

    <script>
    const { createApp } = Vue;
    createApp({
        data() {
            return {
                schedules: <?php echo json_encode($calendarData['schedules'] ?? []); ?>,
                originalCalendar: <?php echo json_encode($calendarData); ?>,
                selectedScheduleKey: Object.keys(<?php echo json_encode($calendarData['schedules'] ?? []); ?>)[0] || '',
                newScheduleName: '',
                newSchedulePeriods: [],
                newScheduleDates: [],
                globalDefaultDisplay: (<?php echo json_encode(isset($calendarData['defaultDisplay']) ? $calendarData['defaultDisplay'] : ''); ?>) || 'clock',
                videoCategories: <?php echo json_encode($videoCategories); ?>,
                slideshowOptions: <?php echo json_encode($availableSlideshows); ?>,
                message: ''
            }
        },
        computed: {
            currentSchedule() {
                if (this.selectedScheduleKey === '__new') {
                    return this.newSchedulePeriods;
                } else {
                    return this.schedules[this.selectedScheduleKey];
                }
            },
            overlapErrors() {
                const errors = [];
                for (let i = 0; i < this.currentSchedule.length; i++) {
                    errors.push({ start: false, end: false });
                }
                for (let i = 0; i < this.currentSchedule.length - 1; i++) {
                    const current = this.currentSchedule[i];
                    const next = this.currentSchedule[i + 1];
                    if (this.parseTime(current.end) > this.parseTime(next.start)) {
                        errors[i].end = true;
                        errors[i+1].start = true;
                    }
                }
                for (let i = 0; i < this.currentSchedule.length; i++) {
                    const period = this.currentSchedule[i];
                    if (this.parseTime(period.start) >= this.parseTime(period.end)) {
                        errors[i].start = true;
                        errors[i].end = true;
                    }
                }
                return errors;
            }
        },
        methods: {
            parseTime(timeStr) {
                let parts = timeStr.split(':');
                if (parts.length !== 2) return 0;
                let hours = parseInt(parts[0], 10);
                let minutes = parseInt(parts[1], 10);
                return hours * 60 + minutes;
            },
            onDisplayDuringChange(period) {
                if (period.displayDuring !== 'youtube') {
                    period.videoCategory = '';
                }
                if (period.displayDuring !== 'google_slides') {
                    period.slideshow = '';
                }
            },
            onDisplayBetweenChange(period) {
                if (period.displayBetween !== 'youtube') {
                    period.betweenVideoCategory = '';
                }
                if (period.displayBetween !== 'google_slides') {
                    period.betweenSlideshow = '';
                }
            },
            addPeriod() {
                const newPeriod = { 
                    name: '', 
                    start: '08:00', 
                    end: '08:45', 
                    description: '', 
                    displayDuring: 'youtube',
                    displayBetween: 'countdown',
                    videoCategory: '',
                    slideshow: '',
                    betweenVideoCategory: '',
                    betweenSlideshow: ''
                };
                if (this.selectedScheduleKey === '__new') {
                    this.newSchedulePeriods.push(newPeriod);
                } else {
                    this.schedules[this.selectedScheduleKey].push(newPeriod);
                }
            },
            removePeriod(index) {
                if (this.selectedScheduleKey === '__new') {
                    this.newSchedulePeriods.splice(index, 1);
                } else {
                    this.schedules[this.selectedScheduleKey].splice(index, 1);
                }
            },
            insertPeriod(index) {
                const current = this.currentSchedule[index];
                const next = this.currentSchedule[index + 1];
                const newPeriod = {
                    name: '',
                    start: current.end,
                    end: next.start,
                    description: '',
                    displayDuring: 'youtube',
                    displayBetween: 'countdown',
                    videoCategory: '',
                    slideshow: '',
                    betweenVideoCategory: '',
                    betweenSlideshow: ''
                };
                if (this.selectedScheduleKey === '__new') {
                    this.newSchedulePeriods.splice(index + 1, 0, newPeriod);
                } else {
                    this.schedules[this.selectedScheduleKey].splice(index + 1, 0, newPeriod);
                }
            },
            insertPeriodBefore() {
                if (this.currentSchedule.length === 0) return;
                const firstPeriod = this.currentSchedule[0];
                const newPeriod = {
                    name: '',
                    start: '07:00',
                    end: firstPeriod.start,
                    description: '',
                    displayDuring: 'youtube',
                    displayBetween: 'countdown',
                    videoCategory: '',
                    slideshow: '',
                    betweenVideoCategory: '',
                    betweenSlideshow: ''
                };
                if (this.selectedScheduleKey === '__new') {
                    this.newSchedulePeriods.splice(0, 0, newPeriod);
                } else {
                    this.schedules[this.selectedScheduleKey].splice(0, 0, newPeriod);
                }
            },
            addDate() {
                this.newScheduleDates.push('');
            },
            removeDate(index) {
                this.newScheduleDates.splice(index, 1);
            },
            removeSchedule() {
                if (this.selectedScheduleKey === '__new') return;
                const scheduleName = this.selectedScheduleKey;
                if (!confirm(`Are you sure you want to remove the schedule "${scheduleName}"? This will also remove any associated dates.`)) {
                    return;
                }
                let updatedSchedules = Object.assign({}, this.schedules);
                delete updatedSchedules[scheduleName];
                this.schedules = updatedSchedules;
                let updatedSpecialDays = Object.assign({}, this.originalCalendar.special_days || {});
                if (updatedSpecialDays[scheduleName]) {
                    delete updatedSpecialDays[scheduleName];
                }
                this.originalCalendar.special_days = updatedSpecialDays;
                let newCalendar = Object.assign({}, this.originalCalendar);
                newCalendar.schedules = this.schedules;
                fetch('display_setup.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'jsonData=' + encodeURIComponent(JSON.stringify(newCalendar, null, 2))
                })
                .then(response => response.text())
                .then(data => {
                    this.message = data;
                    setTimeout(() => { this.message = ''; }, 3000);
                    const keys = Object.keys(this.schedules);
                    this.selectedScheduleKey = keys.length > 0 ? keys[0] : '__new';
                })
                .catch(error => { this.message = "Error saving calendar: " + error; });
            },
            saveCalendar() {
                let updatedSchedules = Object.assign({}, this.schedules);
                if (this.selectedScheduleKey === '__new') {
                    if (!this.newScheduleName) {
                        this.message = "Please enter a name for the new schedule.";
                        return;
                    }
                    updatedSchedules[this.newScheduleName] = this.newSchedulePeriods;
                }
                let newCalendar = Object.assign({}, this.originalCalendar);
                newCalendar.schedules = updatedSchedules;
                newCalendar.defaultDisplay = this.globalDefaultDisplay;
                if (!newCalendar.special_days) {
                    newCalendar.special_days = {};
                }
                if (this.selectedScheduleKey === '__new') {
                    newCalendar.special_days[this.newScheduleName] = [];
                    for (let date of this.newScheduleDates) {
                        if (!date) continue;
                        for (let key in newCalendar.special_days) {
                            if (key === this.newScheduleName) continue;
                            if (newCalendar.special_days[key].includes(date)) {
                                const confirmRemoval = window.confirm(`Date ${date} is already associated with schedule "${key}". Do you want to remove it from "${key}" and assign it to "${this.newScheduleName}"?`);
                                if (confirmRemoval) {
                                    newCalendar.special_days[key] = newCalendar.special_days[key].filter(d => d !== date);
                                } else {
                                    this.message = `Save aborted. Please resolve the date conflict for ${date}.`;
                                    return;
                                }
                            }
                        }
                        newCalendar.special_days[this.newScheduleName].push(date);
                    }
                }
                
                fetch('display_setup.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'jsonData=' + encodeURIComponent(JSON.stringify(newCalendar, null, 2))
                })
                .then(response => response.text())
                .then(data => { 
                    this.message = data; 
                    setTimeout(() => { this.message = ''; }, 3000);
                })
                .catch(error => { this.message = "Error saving calendar: " + error; });
            }
        }
    }).mount('#app');
    </script>
</body>
</html>
