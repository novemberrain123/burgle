package com.example.myapplication

import android.os.AsyncTask
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.myapplication.ui.theme.MyApplicationTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import kotlin.reflect.KSuspendFunction2

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApplicationTheme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "start"){
                        composable("start") { lifecycleScope.launch{ Greeting(navController, ::handleSubmit) }
                        composable("home2_page") { HomeComposable(navController) }
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

    private suspend fun handleSubmit(navController: NavController, text: String) {
        val response = sendHttpGetRequest("https://httpstat.us/")

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


@Composable
fun HomeComposable(navController: NavController){
    Column (
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
            ){
        Text(
            text = "System Is Offline"
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Greeting(navController: NavController, onSubmit: KSuspendFunction2<NavController, String, Unit>, modifier: Modifier = Modifier) {
    var text by remember { mutableStateOf("wdwdw") }

    Column (
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "Sign in",
            style = TextStyle(fontSize = 40.sp, color = Color.Black)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Sign in and keep yourself secure!",
            modifier = modifier
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Username") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { onSubmit(navController,text) }) {
            Text("Submit")
        }
    }

}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MyApplicationTheme {

    }
}

@Composable
fun showToast(message: String) {
    Toast.makeText(LocalContext.current, message, Toast.LENGTH_SHORT).show()
}