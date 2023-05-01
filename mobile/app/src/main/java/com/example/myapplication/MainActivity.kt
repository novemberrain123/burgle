package com.example.myapplication

import android.Manifest
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import androidx.preference.PreferenceManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.getSystemService
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.rememberAsyncImagePainter
import coil.compose.rememberImagePainter
import com.bumptech.glide.Glide
import com.bumptech.glide.integration.compose.ExperimentalGlideComposeApi
import com.bumptech.glide.integration.compose.GlideImage
import com.example.myapplication.ui.theme.MyApplicationTheme
import com.firebase.ui.auth.AuthUI
import com.firebase.ui.auth.FirebaseAuthUIActivityResultContract
import com.firebase.ui.auth.data.model.FirebaseAuthUIAuthenticationResult
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.Constants.MessageNotificationKeys.TAG
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.storage.ktx.component1
import com.google.firebase.storage.ktx.component2
import com.google.firebase.storage.ktx.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileInputStream
import java.util.Vector
import java.util.concurrent.TimeUnit
import kotlin.reflect.KSuspendFunction2


class MainActivity : ComponentActivity() {

//    private val signInLauncher = registerForActivityResult(
//        FirebaseAuthUIActivityResultContract()
//    ) { res ->
//        this.onSignInResult(res)
//    }
//
//    private fun onSignInResult(result: FirebaseAuthUIAuthenticationResult) {
//        val response = result.idpResponse
//        if (result.resultCode == RESULT_OK) {
//            // Successfully signed in
//            val user = FirebaseAuth.getInstance().currentUser
//            // ...
//        } else {
//            // Sign in failed. If response is null the user canceled the
//            // sign-in flow using the back button. Otherwise check
//            // response.getError().getErrorCode() and handle the error.
//            // ...
//        }
//    }
    // Declare the launcher at the top of your Activity/Fragment:
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // FCM SDK (and your app) can post notifications.
        } else {
            // TODO: Inform user that that your app will not show notifications.
        }
    }

    private fun askNotificationPermission() {
        // This is only necessary for API level >= 33 (TIRAMISU)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                // FCM SDK (and your app) can post notifications.
            } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
                // TODO: display an educational UI explaining to the user the features that will be enabled
                //       by them granting the POST_NOTIFICATION permission. This UI should provide the user
                //       "OK" and "No thanks" buttons. If the user selects "OK," directly request the permission.
                //       If the user selects "No thanks," allow the user to continue without notifications.
            } else {
                // Directly ask for the permission
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        askNotificationPermission()
        FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@OnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result

            // Log and toast
            val msg = getString(R.string.msg_token_fmt, token)
            Log.d(TAG, msg)
            Toast.makeText(baseContext, msg, Toast.LENGTH_LONG).show()
        })
//
//        // Choose authentication providers
//        val providers = arrayListOf(
//            AuthUI.IdpConfig.EmailBuilder().build())
//
//// Create and launch sign-in intent
//        val signInIntent = AuthUI.getInstance()
//            .createSignInIntentBuilder()
//            .setIsSmartLockEnabled(false)
//            .setAvailableProviders(providers)
//            .build()
//        signInLauncher.launch(signInIntent)


        setContent {
            MyApplicationTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(navController = navController, startDestination = "home2_page") {
//                        composable("start") { LoginComposable(navController, ::handleSubmit) }
                        composable("home2_page") { HomeComposable(navController) }
                        composable("camera_logs_page") { CameraLogsComposable(navController) }
                    }
                }
            }
        }
    }

    suspend fun sendHttpGetRequest(url: String): String {
        return withContext(Dispatchers.IO) {
            val client = OkHttpClient()
            val request = Request.Builder()
                .url(url)
                .build()

            val response = client.newCall(request).execute()
            response.body?.string() ?: ""
        }
    }

    suspend fun handleSubmit(navController: NavController, text: String) {
        val response = sendHttpGetRequest("john.tplinkdns.com/home")

        if (response != "") {
            Toast.makeText(this, "Login successful!", Toast.LENGTH_SHORT).show()
            navController.navigate("home2_page")
        } else {
            Toast.makeText(this, "Login failed!", Toast.LENGTH_SHORT).show()
            navController.navigate("home2_page")
        }
        Toast.makeText(this, "You entered: $text", Toast.LENGTH_SHORT).show()
    }
}

@OptIn(ExperimentalGlideComposeApi::class)
@Composable
fun CameraLogsComposable(navController: NavController) {
    val context = LocalContext.current
    Row() {
        Button(onClick = { navController.navigate("home2_page") }) {
            Column(
                modifier = Modifier
                    .padding(5.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.back),
                    contentDescription = "Image",
                    modifier = Modifier
                        .height(15.dp)
                        .width(15.dp)
                )
            }

        }
    }

    Spacer(modifier = Modifier.height(30.dp))

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Camera Logs",
            style = TextStyle(fontSize = 35.sp, color = Color.Black)

        )
        Spacer(modifier = Modifier.height(8.dp))


        val storageRef = Firebase.storage.reference.child("data")
        val urls = mutableListOf<String>()

        storageRef.listAll()
            .addOnSuccessListener { listResult ->
                listResult.items.forEach { item ->
                    item.downloadUrl.addOnSuccessListener { uri ->
                        urls.add(uri.toString())
                    }
                }
            }
            .addOnFailureListener { exception ->
                Log.d("exeption", exception.toString())
            }

        LazyColumn {
            items(urls.size) { imageUrl ->
                val painter = rememberAsyncImagePainter(model = imageUrl)
                Image(
                    painter = painter,
                    contentDescription = "Image",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                )
            }
        }
    }
}

@Composable
fun HomeComposable(navController: NavController) {
    val context = LocalContext.current
    val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
    var notificationEnabled by remember { mutableStateOf(sharedPreferences.getBoolean("notifications_enabled", true)) }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = if(notificationEnabled) "System Online" else "System Offline",
            style = TextStyle(fontSize = 35.sp, color = Color.Black)

        )
        Spacer(modifier = Modifier.height(8.dp))
        Switch(
            checked = notificationEnabled,
            onCheckedChange = {isChecked ->
                notificationEnabled = isChecked
                sharedPreferences.edit().putBoolean("notifications_enabled", isChecked).apply()
                if (!isChecked) {
                    val database = Firebase.database("https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app")
                    val myRef = database.getReference("turnOn")

                    myRef.setValue(0)
                }
                else {
                    val database = Firebase.database("https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app")
                    val myRef = database.getReference("turnOn")

                    myRef.setValue(1)
                }
            })
        Spacer(modifier = Modifier.height(8.dp))
//        Button(onClick = { navController.navigate("camera_logs_page") }) {
//            Text("Camera Logs")
//        }
    }
}

//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun LoginComposable(
//    navController: NavController,
//    onSubmit: KSuspendFunction2<NavController, String, Unit>,
//    modifier: Modifier = Modifier
//) {
//    var text by remember { mutableStateOf("wdwdw") }
//    val coroutineScope = rememberCoroutineScope()
//    val context = LocalContext.current
////    val httpGet: (text: String) -> Unit = {
////        coroutineScope.launch {
////            val response = sendHttpGetRequest("https://john.tplinkdns.com:42069/home")
////
////            if (response == "") {
////                Toast.makeText(context, "Login failed!", Toast.LENGTH_SHORT).show()
////            }
////
////            navController.navigate("home2_page")
////
////        }
////
////
////    }
//
//    Column(
//        modifier = Modifier
//            .fillMaxWidth()
//            .padding(16.dp),
//        verticalArrangement = Arrangement.Center,
//        horizontalAlignment = Alignment.CenterHorizontally
//    ) {
//        Text(
//            text = "Sign in",
//            style = TextStyle(fontSize = 40.sp, color = Color.Black)
//        )
//        Spacer(modifier = Modifier.height(8.dp))
//        Text(
//            text = "Sign in and keep yourself secure!",
//            modifier = modifier
//        )
//        Spacer(modifier = Modifier.height(8.dp))
//        TextField(
//            value = text,
//            onValueChange = { text = it },
//            label = { Text("Username") }
//        )
//        Spacer(modifier = Modifier.height(8.dp))
//        Button(onClick = {
//            coroutineScope.launch { uploadGetFile(context, navController, text) }
//        }) {
//            Text("Submit")
//        }
//    }
//
//}

//suspend fun uploadGetFile(context: Context, navController: NavController, username: String){
//    val storage = Firebase.storage
//    val fileRef = storage.reference.child("&${username}/back.png")
//    val stream = FileInputStream(File("D:\\Code\\burgle\\mobile\\app\\src\\main\\res\\drawable\\back.png"))
//    var uploadTask = fileRef.putStream(stream)
//    uploadTask.addOnFailureListener {
//        // Handle unsuccessful uploads
//    }.addOnSuccessListener { taskSnapshot ->
//        // taskSnapshot.metadata contains file metadata such as size, content-type, etc.
//        // ...
//    }
//
//    TimeUnit.SECONDS.sleep(5L)
//
//    //get server folder
//    storage.reference.listAll()
//        .addOnSuccessListener {
//                (items,prefixes) ->
//            prefixes.forEach {prefix ->
//                if(prefix.name == username){
//                   // login accepted
//                    val app_preferences = PreferenceManager
//                        .getDefaultSharedPreferences(context)
//
//                    val editor = app_preferences.edit()
//                    editor.putBoolean("isFirstTime", false)
//                    editor.commit()
//                    navController.navigate("home2_page")
//                }
//            }
//        }
//}
suspend fun sendHttpGetRequest(url: String): String {
    return withContext(Dispatchers.IO) {
        val client = OkHttpClient()
        val request = Request.Builder()
            .url(url)
            .build()

        val response = client.newCall(request).execute()
        response.body?.string() ?: ""
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MyApplicationTheme {

    }
}
