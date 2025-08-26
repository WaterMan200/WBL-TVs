<?php
// group_setup.php

// Optionally, you can add access control logic here, similar to display_setup.php.

$jsonFile = 'json/displays.json';
if (file_exists($jsonFile)) {
    $jsonContent = file_get_contents($jsonFile);
    $displaysData = json_decode($jsonContent, true);
    if ($displaysData === null) {
         $displaysData = ['displays' => [], 'groups' => []];
    }
} else {
    $displaysData = ['displays' => [], 'groups' => []];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Display Groups Setup</title>
    <script src="https://unpkg.com/vue@3"></script>
    <style>
       body { font-family: Arial, sans-serif; padding: 20px; }
       h1, h2 { color: #333; }
       .section { margin-bottom: 40px; border: 1px solid #ccc; padding: 20px; }
       label { display: inline-block; width: 100px; }
       input, select { margin: 5px; }
       button { margin: 5px; }
       hr { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Display Groups Setup</h1>
    <div id="app">
       <!-- Displays Section -->
       <div class="section">
          <h2>Displays</h2>
          <div v-for="(display, index) in displays" :key="display.id">
             <label>ID:</label>
             <input type="text" v-model="display.id" readonly /><br/>
             <label>Description:</label>
             <input type="text" v-model="display.description" placeholder="Description" /><br/>
             <label>Location:</label>
             <input type="text" v-model="display.location" placeholder="Location" /><br/>
             <label>Group:</label>
             <select v-model="display.group">
                <option v-for="(group, key) in groups" :value="key">{{ group.name }}</option>
             </select>
             <button @click="removeDisplay(index)">Delete</button>
             <hr/>
          </div>
          <button @click="addDisplay">Add Display</button>
       </div>
       <!-- Groups Section -->
       <div class="section">
          <h2>Groups</h2>
          <div v-for="(group, key) in groups" :key="key">
             <label>Group ID:</label>
             <input type="text" v-model="group.id" readonly /><br/>
             <label>Name:</label>
             <input type="text" v-model="group.name" placeholder="Group Name" /><br/>
             <label>Schedule:</label>
             <input type="text" v-model="group.schedule" placeholder="e.g., Regular, Flex_Friday" /><br/>
             <button @click="removeGroup(key)">Delete Group</button>
             <hr/>
          </div>
          <button @click="addGroup">Add Group</button>
       </div>
       <button @click="saveData">Save Changes</button>
       <p v-if="message">{{ message }}</p>
    </div>

    <script>
       const { createApp } = Vue;
       createApp({
          data() {
             return {
                displays: <?php echo json_encode($displaysData['displays'] ?? []); ?>,
                groups: <?php 
                   // Ensure groups is an object; if empty, default to an empty object.
                   echo json_encode($displaysData['groups'] ?? new stdClass());
                ?>,
                message: ""
             }
          },
          methods: {
             addDisplay() {
                // Generate a new display ID based on the highest current ID.
                let newId = 0;
                if (this.displays.length) {
                    newId = Math.max(...this.displays.map(d => parseInt(d.id))) + 1;
                }
                // Use the first available group (if any) as default.
                const defaultGroup = Object.keys(this.groups)[0] || "";
                this.displays.push({
                   id: newId.toString(),
                   description: "",
                   location: "",
                   group: defaultGroup
                });
             },
             removeDisplay(index) {
                if (confirm("Are you sure you want to delete this display?")) {
                   this.displays.splice(index, 1);
                }
             },
             addGroup() {
                // Create a new group key.
                let newKey = "Group_" + (Object.keys(this.groups).length + 1);
                this.groups[newKey] = {
                   id: newKey,
                   name: "New Group",
                   schedule: ""
                };
             },
             removeGroup(key) {
                if (confirm("Are you sure you want to delete this group?")) {
                   // Remove group assignment from displays that use this group.
                   this.displays.forEach(d => {
                      if (d.group === key) d.group = "";
                   });
                   delete this.groups[key];
                }
             },
             saveData() {
                const data = {
                   displays: this.displays,
                   groups: this.groups
                };
                fetch("process/group_process.php", {
                   method: "POST",
                   headers: {
                      "Content-Type": "application/x-www-form-urlencoded"
                   },
                   body: "jsonData=" + encodeURIComponent(JSON.stringify(data, null, 2))
                })
                .then(response => response.text())
                .then(text => {
                   this.message = text;
                   setTimeout(() => { this.message = ""; }, 3000);
                })
                .catch(err => {
                   this.message = "Error saving data: " + err;
                });
             }
          }
       }).mount("#app");
    </script>
</body>
</html>
