package com.jaystack.jayscrum;

import java.util.List;

import net.robotmedia.billing.BillingController;
import net.robotmedia.billing.BillingController.BillingStatus;
import net.robotmedia.billing.model.Transaction;
import net.robotmedia.billing.model.TransactionManager;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import org.apache.cordova.api.*;

public class InAppBillingPlugin extends Plugin {

	public String _callbackId;
	
	static JSONArray toJSON(List<Transaction> transactions) {
		JSONArray jsonTrans = new JSONArray();
		for(Transaction t : transactions){
			JSONObject o = new JSONObject();
			try{
				o.put("OrderId", t.orderId);
				o.put("ProductId", t.productId);
				o.put("purchaseToken", t.purchaseToken);
				if(t.developerPayload.startsWith("[")){
					o.put("DevPayLoad", new JSONArray(t.developerPayload).getJSONObject(0));
				}
				else{
					o.put("DevPayLoad", new JSONObject(t.developerPayload));
				}
			}catch(JSONException ex){
				Log.d("InApp", ex.toString());
			}
			jsonTrans.put(o);
		}
		return jsonTrans;
	}
	
	@Override
	public PluginResult execute(String action, JSONArray arg1, String callback) {
		if(action.equals("checkSupported")){
			_callbackId = callback;
			BillingStatus status =  MainActivity.eInstance.checkBillingSupported();
			PluginResult result = new PluginResult(PluginResult.Status.OK, status.toString());
			//result.setKeepCallback(true);
			
			return result;
		}else if(action.equals("transactions")){
			StringBuilder builder = new StringBuilder();
			Log.d("InApp", "Start read db");
			List<Transaction> transactions = BillingController.getTransactions(MainActivity.eInstance);
			JSONArray jsonTransactions = toJSON(transactions);
			Log.d("InApp", "End read db: "+transactions.size());
			Log.d("InApp", "transactions: "+jsonTransactions.toString());
			PluginResult result = new PluginResult(PluginResult.Status.OK,jsonTransactions);
			return result;
		}else if(action.equals("subscribe")){
			this._callbackId = callback;
			PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
			result.setKeepCallback(true);
			
			try {
				Log.d("InApp", "Starting subscription with following data: "+arg1.getString(0));
				MainActivity.eInstance.MonthlySubscription(this, arg1.getString(0));
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			return result;
		}
		
		PluginResult pluginResult = new PluginResult(PluginResult.Status.INVALID_ACTION, "Not valid action: "+action);
		return pluginResult;
	}

}
 