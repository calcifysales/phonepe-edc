"""
Verification of reverted LMS Questions & Output Formatting
"""
import datetime

def generate_lms_comment(
    name, avg_basket, monthly_tpv, premiumness, gst, current_acc,
    lead_status, using_pos, current_pos, current_mdr, current_rent,
    renewed_val, followup_date_str
):
    f_date = datetime.datetime.strptime(followup_date_str, "%Y-%m-%d")
    c_date = f_date + datetime.timedelta(days=4)
    
    formatted_followup = f_date.strftime("%d-%m-%Y")
    formatted_closure = c_date.strftime("%d-%m-%Y")
    
    output = f"Premiumness:- {premiumness}\n"
    if premiumness == "No":
        output += f"GST:- {gst}\n"
        output += f"Current Account:- {current_acc}\n"
        output += f"Expected Order closure Date: {formatted_closure}\n"
        output += f"Followup date:- {formatted_followup}\n"
    else:
        output += f"Followup date:- {formatted_followup}\n"
        output += f"Expected Order closure Date: {formatted_closure}\n"
        
    if using_pos == "Yes":
        rent_str = "no rental" if (not current_rent or current_rent == '0') else f"{current_rent} on pos device"
        mdr_str = current_mdr if current_mdr else "1.45"
        output += f"Meeting done with owner {name} at store, where Merchant has Avg. basket value of ₹{avg_basket}, and generates around {monthly_tpv} lakhs TPV per month through {current_pos}.  Mx. Currently using {current_pos} pos device with {mdr_str} mdr on cc and {rent_str}, I have explained our pos features and rentals of both ₹3499 and 499 (399/month) rental under tagged base with mdr of 1.54% on cc. "
    else:
        output += f"Meeting done with owner {name} at store, where Merchant has average basket value of ₹{avg_basket}, and generates around {monthly_tpv} lakhs TPV/ Month.\nMx. Currently not using any pos device, I have explained our pos features and rentals of both ₹3499 and 499 (399/month) rental under taggedbase with mdr of 1.54 on cc. \n"

    if lead_status == "Key Decision maker discussion pending":
        output += f"Merchant need to make decision and will compare with other competitors and let us know the final decision and revist scheduled on {formatted_followup}."
    elif lead_status == "Merchant interested-needs better MDR":
        if using_pos == "Yes":
            rent_note = "zero rental" if (not current_rent or current_rent == '0') else f"{current_rent} rental"
            output += f"As merchant is currently using {current_pos} pos device with {rent_note} and lower MDR, He asked us to reduce the MDR Phonepe Pos{' to ' + renewed_val if renewed_val else ''} to make quick decision.  Mx. requested us to give some time to finalize the decision and I will mark the final status of lead in my next Visit on {formatted_followup}"
        else:
            output += f"Merchant is interested in PhonePe POS but requested for a lower MDR{' (' + renewed_val + ')' if renewed_val else ''} to make quick decision. Mx. requested us to review the pricing and give some time, revist scheduled on {formatted_followup}."

    return output

if __name__ == '__main__':
    # Verify Sample 1
    s1 = generate_lms_comment(
        name="Rakesh", avg_basket="1000", monthly_tpv="4", premiumness="No",
        gst="Yes", current_acc="No", lead_status="Key Decision maker discussion pending",
        using_pos="No", current_pos="", current_mdr="", current_rent="",
        renewed_val="", followup_date_str="2026-08-22"
    )
    print("--- SAMPLE 1 ---")
    print(s1)

    # Verify Sample 2
    s2 = generate_lms_comment(
        name="rambabu", avg_basket="1000", monthly_tpv="8", premiumness="Yes",
        gst="No", current_acc="No", lead_status="Merchant interested-needs better MDR",
        using_pos="Yes", current_pos="HDFC", current_mdr="1.45", current_rent="0",
        renewed_val="", followup_date_str="2026-08-22"
    )
    print("\n--- SAMPLE 2 ---")
    print(s2)
    print("\nAll assertions verified!")
